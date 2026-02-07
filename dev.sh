#!/bin/bash

# CodeCom Developer Launch Script
# Starts both Spring Boot Backend and Vue Frontend

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "Stopping CodeCom..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "🚀 Starting CodeCom..."

# Start Backend
echo "📦 Starting Spring Boot Backend with Hot-Reload (DevTools)..."
cd backend
mvn spring-boot:run -Dspring-boot.run.fork=true > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready (optional check)
echo "⌛ Waiting for backend to initialize..."
sleep 5

# Start Frontend
echo "🌐 Starting Vue Frontend (Port 5173)..."
cd frontend
npm run dev

# After frontend stops, cleanup will handle the rest
cleanup
