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

# Set up environment variables for the container
echo "Setting up environment variables..."
DATABASE_URL="mysql://reworkd_platform:Platform_DB_Pass_2025!@34.66.109.248:3306/reworkd_platform"
NEXTAUTH_SECRET="grantcraft_next_auth_secret_2025!"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"

# Run the container with environment variables
echo "Starting container..."
docker run -p 3000:3000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  -e NEXTAUTH_URL="$NEXTAUTH_URL" \
  -e NEXT_PUBLIC_BACKEND_URL="$NEXT_PUBLIC_BACKEND_URL" \
  -e SKIP_ENV_VALIDATION=true \
  --name grantcraft-next-container -d grantcraft-next

echo "Container started. Access the application at http://localhost:3000"
echo "To view logs: docker logs -f grantcraft-next-container"