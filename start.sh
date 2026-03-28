#!/bin/bash

set -e

BASE_DIR="/home/yusuf/nestjs"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"

BACKEND_PORT=3001
FRONTEND_PORT=3000

BACKEND_LOG="$BASE_DIR/backend.log"
FRONTEND_LOG="$BASE_DIR/frontend.log"
MINIO_LOG="$BASE_DIR/minio.log"

echo "==================================="
echo "Starting CSMS Services..."
echo "==================================="

# Load NVM if available
[ -f "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"

# -------------------------------
# Utility Functions
# -------------------------------

kill_port() {
    PORT=$1
    PID=$(fuser ${PORT}/tcp 2>/dev/null)

    if [ -n "$PID" ]; then
        echo "⚠️  Port $PORT in use (PID: $PID). Attempting graceful shutdown..."
        kill $PID 2>/dev/null || true
        sleep 2

        if fuser ${PORT}/tcp >/dev/null 2>&1; then
            echo "🔥 Force killing PID: $PID"
            kill -9 $PID 2>/dev/null || true
        fi
    fi
}

wait_for_service() {
    PORT=$1
    for i in {1..10}; do
        if ss -tulpn | grep -q ":$PORT"; then
            return 0
        fi
        sleep 1
    done
    return 1
}

is_minio_running() {
    ss -tulpn | grep -q ":9000"
}

start_minio() {
    echo "🚀 Starting MinIO..."
    nohup minio server ~/minio-data \
        --address "0.0.0.0:9000" \
        --console-address "0.0.0.0:9001" \
        > "$MINIO_LOG" 2>&1 &
    sleep 3
}

# -------------------------------
# PostgreSQL
# -------------------------------

echo ""
echo "[1/3] Checking PostgreSQL..."
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL is running."
else
    echo "🚀 Starting PostgreSQL..."
    sudo systemctl start postgresql
    sleep 2
fi

# -------------------------------
# MinIO (with verification)
# -------------------------------

echo ""
echo "[2/3] Checking MinIO..."

if is_minio_running; then
    echo "✅ MinIO already running on port 9000"
else
    echo "⚠️  MinIO not running."

    if command -v minio >/dev/null; then
        start_minio

        if is_minio_running; then
            echo "✅ MinIO started successfully"
            echo "🌐 Console: http://localhost:9001"
        else
            echo "❌ MinIO failed to start!"
            echo "📄 Check logs:"
            echo "tail -f $MINIO_LOG"
        fi
    else
        echo "❌ MinIO not installed. Skipping..."
    fi
fi

# -------------------------------
# Backend
# -------------------------------

echo ""
echo "[3/3] Starting Backend (port $BACKEND_PORT)..."

kill_port $BACKEND_PORT

cd "$BACKEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

echo "🔄 Syncing database schema..."
npx prisma db push || echo "⚠️ Prisma sync failed (continuing)"

if [ ! -d "dist" ]; then
    echo "🏗️ Building backend..."
    npm run build
fi

echo "🚀 Starting backend..."
nohup npm run start:dev > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

if ! wait_for_service $BACKEND_PORT; then
    echo "❌ Backend failed to start!"
    exit 1
fi

echo "✅ Backend running (PID: $BACKEND_PID)"

# -------------------------------
# Frontend
# -------------------------------

echo ""
echo "Starting Frontend (port $FRONTEND_PORT)..."

kill_port $FRONTEND_PORT

cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d ".next" ]; then
    echo "🏗️ Building frontend..."
    npm run build
fi

echo "🚀 Starting frontend..."
nohup npm run dev > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

if ! wait_for_service $FRONTEND_PORT; then
    echo "❌ Frontend failed to start!"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Frontend running (PID: $FRONTEND_PID)"

# -------------------------------
# Done
# -------------------------------

echo ""
echo "==================================="
echo "🎉 CSMS Services Started Successfully!"
echo "==================================="

echo ""
echo "Backend:  http://localhost:$BACKEND_PORT"
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "MinIO:    http://localhost:9001"

echo ""
echo "Logs:"
echo "  Backend:  $BACKEND_LOG"
echo "  Frontend: $FRONTEND_LOG"
echo "  MinIO:    $MINIO_LOG"

echo ""
echo "To stop:"
echo "kill $BACKEND_PID $FRONTEND_PID"