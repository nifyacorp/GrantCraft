# GrantCraft User Service

## Overview

The User Service manages user profiles and settings within the GrantCraft application. It provides APIs for retrieving, updating, and managing user data beyond the basic authentication provided by Firebase Auth.

## Features

- User profile retrieval and management
- User settings management
- Service-to-service user data retrieval
- Integration with Firebase Auth for authentication

## API Endpoints

The service exposes the following API endpoints:

### Public Endpoints

- `GET /health` - Health check endpoint

### Authenticated Endpoints

- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `GET /api/v1/users/{user_id}` - Get user by ID
- `PUT /api/v1/users/me/settings` - Update user settings
- `GET /api/v1/users` - List users (admin only)

### Internal Service-to-Service Endpoints

- `GET /api/v1/internal/users/{user_id}` - Get user profile data (requires appropriate headers)

## Architecture

The User Service follows the standard GrantCraft microservice architecture:

- **API Layer** (`main.py`): FastAPI routes and endpoint definitions
- **Service Layer** (`services.py`): Business logic and operations
- **Data Layer** (`database.py`): Firestore database operations
- **Auth Layer** (`auth.py`): Authentication and authorization logic
- **Models** (`models.py`): Data models and schemas

## Configuration

Configuration is handled via environment variables:

- `FIREBASE_PROJECT_ID` - Firebase project ID
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON file
- `DEBUG` - Enable debug mode (true/false)
- `PROJECT_SERVICE_URL` - URL for the Project Service

## Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export FIREBASE_PROJECT_ID="your-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
export DEBUG="true"

# Run the service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

## Docker

Build and run the Docker container:

```bash
# Build container
docker build -t grantcraft-user-service .

# Run container
docker run -p 8080:8080 \
  -e FIREBASE_PROJECT_ID="your-project-id" \
  -e GOOGLE_APPLICATION_CREDENTIALS="/app/credentials.json" \
  -v /path/to/credentials.json:/app/credentials.json \
  grantcraft-user-service
``` 