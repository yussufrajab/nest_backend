#!/bin/bash

BASE_DIR="/home/yusuf/nestjs"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"

BACKEND_PORT=3001
FRONTEND_PORT=3000
MINIO_PORT=9000

BACKEND_LOG="$BASE_DIR/backend.log"
FRONTEND_LOG="$BASE_DIR/frontend.log"
MINIO_LOG="$BASE_DIR/minio.log"

# Load NVM if available
[ -f "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"

# -------------------------------
# Utility Functions
# -------------------------------

kill_port() {
    PORT=$1
    PID=$(fuser ${PORT}/tcp 2>/dev/null)

    if [ -n "$PID" ]; then
        echo "🛑 Stopping process on port $PORT (PID: $PID)..."
        kill $PID 2>/dev/null || true
        sleep 2

        if fuser ${PORT}/tcp >/dev/null 2>&1; then
            echo "🔥 Force killing PID: $PID"
            kill -9 $PID 2>/dev/null || true
        fi
    else
        echo "✅ No process on port $PORT"
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

check_port() {
    PORT=$1
    NAME=$2

    if ss -tulpn | grep -q ":$PORT"; then
        PID=$(fuser ${PORT}/tcp 2>/dev/null)
        echo "✅ $NAME is RUNNING (port $PORT, PID: $PID)"
    else
        echo "❌ $NAME is NOT running (port $PORT)"
    fi
}

# -------------------------------
# Actions
# -------------------------------

start_services() {
    echo "==================================="
    echo "Starting CSMS Services..."
    echo "==================================="

    echo ""
    echo "[1/3] PostgreSQL..."
    if systemctl is-active --quiet postgresql; then
        echo "✅ PostgreSQL running"
    else
        echo "🚀 Starting PostgreSQL..."
        sudo systemctl start postgresql
        sleep 2
    fi

    echo ""
    echo "[2/3] MinIO..."
    if is_minio_running; then
        echo "✅ MinIO already running"
    else
        if command -v minio >/dev/null; then
            start_minio
            if is_minio_running; then
                echo "✅ MinIO started (http://localhost:9001)"
            else
                echo "❌ MinIO failed. Check logs: $MINIO_LOG"
            fi
        else
            echo "❌ MinIO not installed"
        fi
    fi

    echo ""
    echo "[3/3] Backend..."
    kill_port $BACKEND_PORT
    cd "$BACKEND_DIR"

    [ ! -d "node_modules" ] && npm install
    npx prisma db push || true
    [ ! -d "dist" ] && npm run build

    nohup npm run start:dev > "$BACKEND_LOG" 2>&1 &
    BACKEND_PID=$!

    wait_for_service $BACKEND_PORT || { echo "❌ Backend failed"; exit 1; }

    echo "✅ Backend running (PID: $BACKEND_PID)"

    echo ""
    echo "Frontend..."
    kill_port $FRONTEND_PORT
    cd "$FRONTEND_DIR"

    [ ! -d "node_modules" ] && npm install
    [ ! -d ".next" ] && npm run build

    nohup npm run dev > "$FRONTEND_LOG" 2>&1 &
    FRONTEND_PID=$!

    wait_for_service $FRONTEND_PORT || { echo "❌ Frontend failed"; exit 1; }

    echo "✅ Frontend running (PID: $FRONTEND_PID)"

    echo ""
    echo "🎉 All services started!"
}

stop_services() {
    echo "==================================="
    echo "Stopping CSMS Services..."
    echo "==================================="

    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    kill_port $MINIO_PORT

    echo "✅ All services stopped"
}

restart_services() {
    echo "🔁 Restarting..."
    stop_services
    sleep 2
    start_services
}

status_services() {
    echo "==================================="
    echo "CSMS Status"
    echo "==================================="

    check_port $BACKEND_PORT "Backend"
    check_port $FRONTEND_PORT "Frontend"
    check_port $MINIO_PORT "MinIO"

    echo ""
    echo "URLs:"
    echo "Backend:  http://localhost:$BACKEND_PORT"
    echo "Frontend: http://localhost:$FRONTEND_PORT"
    echo "MinIO:    http://localhost:9001"

    echo ""
    pgrep -af "node|minio" || echo "No relevant processes"
}

# -------------------------------
# Menu
# -------------------------------

echo ""
echo "Choose an option:"
echo "1) Start"
echo "2) Stop"
echo "3) Restart"
echo "4) Status"
echo "5) Exit"

read -p "Enter choice [1-5]: " choice

case $choice in
    1) start_services ;;
    2) stop_services ;;
    3) restart_services ;;
    4) status_services ;;
    5) exit 0 ;;
    *) echo "Invalid option" ;;
esac