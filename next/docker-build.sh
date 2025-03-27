#!/bin/bash

# Change to the directory containing the Dockerfile
cd "$(dirname "$0")"

# Build the Docker image
docker build -t grantcraft-next .

# Run the container
docker run -p 3000:3000 --name grantcraft-next-container -d grantcraft-next

echo "Container started. Access the application at http://localhost:3000"
