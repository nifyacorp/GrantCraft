#!/bin/bash

# Change to the directory containing the Dockerfile
cd "$(dirname "$0")"

# Stop and remove existing container if it exists
if docker ps -a | grep -q grantcraft-next-container; then
  echo "Stopping and removing existing container..."
  docker stop grantcraft-next-container
  docker rm grantcraft-next-container
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t grantcraft-next .

# Run the container
echo "Starting container..."
docker run -p 3000:3000 --name grantcraft-next-container -d grantcraft-next

echo "Container started. Access the application at http://localhost:3000"
echo "To view logs: docker logs -f grantcraft-next-container"