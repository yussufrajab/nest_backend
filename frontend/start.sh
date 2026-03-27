#!/bin/bash

# Start frontend server
cd /home/yusuf/nestjs/frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build frontend if not already built
if [ ! -d ".next" ]; then
    echo "Building frontend..."
    npm run build
fi

# Start server with PM2
echo "Starting frontend server..."
pm2 start server.js --name csms-frontend
