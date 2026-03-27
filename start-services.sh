#!/bin/bash

# CSMS Services Startup Script
# Starts backend (port 3001) and frontend (port 3000)

echo "==================================="
echo "Starting CSMS Services..."
echo "==================================="

# Check and start PostgreSQL
echo ""
echo "[1/3] Checking PostgreSQL..."
if systemctl is-active --quiet postgresql; then
    echo "PostgreSQL is already running."
else
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
    sleep 2
fi

# Check and start MinIO
echo ""
echo "[2/3] Checking MinIO..."
if systemctl is-active --quiet minio 2>/dev/null; then
    echo "MinIO is already running."
else
    echo "MinIO is not running. Skipping (requires sudo)..."
fi

# Start Backend (port 3001)
echo ""
echo "[3/3] Starting Backend (port 3001)..."
cd /home/yusuf/nestjs/backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Run migrations
echo "Syncing database schema..."
npx prisma db push || echo "Warning: Database sync failed, continuing..."

# Build backend if needed
if [ ! -d "dist" ]; then
    echo "Building backend..."
    npm run build
fi

# Start backend in background
echo "Starting backend server..."
cd /home/yusuf/nestjs/backend
nohup npm run start:dev > /home/yusuf/nestjs/backend.log 2>&1 &
BACKEND_PID=$!
sleep 5

# Verify backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Backend failed to start!"
    exit 1
fi

echo "Backend is running on http://localhost:3001 (PID: $BACKEND_PID)"

# Start Frontend (port 3000) with Turbopack disabled
echo ""
echo "Starting Frontend (port 3000) with Turbopack disabled..."
cd /home/yusuf/nestjs/frontend

# Set environment variable to disable Turbopack
# Using --webpack flag in package.json to disable Turbopack

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Build frontend if needed
if [ ! -d ".next" ]; then
    echo "Building frontend..."
    npm run build
fi

# Start frontend in background
echo "Starting frontend server..."
nohup npm run dev > /home/yusuf/nestjs/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 5

# Verify frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "ERROR: Frontend failed to start!"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "==================================="
echo "CSMS Services Started Successfully!"
echo "==================================="
echo ""
echo "Backend:  http://localhost:3001 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Log files:"
echo "  Backend:  /home/yusuf/nestjs/backend.log"
echo "  Frontend: /home/yusuf/nestjs/frontend.log"
echo ""
echo "To stop all services, press Ctrl+C or kill $BACKEND_PID $FRONTEND_PID"
