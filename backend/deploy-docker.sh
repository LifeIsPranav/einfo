#!/bin/bash

# Deployment script for E-Info Backend
echo "🚀 Starting E-Info Backend Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your environment variables."
    echo "You can use .env.example as a template:"
    echo "  cp .env.example .env"
    echo "  # Then edit .env with your actual values"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build the Docker image
echo "🔨 Building Docker image..."
docker-compose build

# Start the containers
echo "🚀 Starting containers..."
docker-compose up -d

# Check if containers are running
echo "✅ Checking container status..."
docker-compose ps

echo ""
echo "🎉 Deployment completed!"
echo "Your backend should be running at http://localhost:8000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo "To restart: docker-compose restart"
