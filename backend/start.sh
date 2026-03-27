#!/bin/bash

# Start backend server
cd /home/yusuf/nestjs/backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Build backend if not already built
if [ ! -d "dist" ]; then
    echo "Building backend..."
    npm run build
fi

# Start server with PM2
echo "Starting backend server..."
pm2 start dist/main.js --name csms-backend
