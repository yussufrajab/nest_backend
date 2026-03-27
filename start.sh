#!/bin/bash

echo "Starting CSMS System..."

# Start PostgreSQL
echo "Starting PostgreSQL..."
sudo systemctl start postgresql

# Start Minio
echo "Starting Minio..."
sudo systemctl start minio

# Wait for services to start
sleep 5

# Start backend
echo "Starting backend..."
cd /home/yusuf/nestjs/backend
./start.sh

# Start frontend
echo "Starting frontend..."
cd /home/yusuf/nestjs/frontend
./start.sh

echo "CSMS System started successfully!"
