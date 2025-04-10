# GrantCraft Chat Service

## Overview

The Chat Service (`chat-service`) manages chat sessions and messages for the GrantCraft system. It provides APIs for creating, retrieving, and managing chat sessions and messages between users and the AI assistant within the context of specific grant projects.

## Key Responsibilities

- **Chat Session Management:** Creating, retrieving, and updating chat sessions associated with projects
- **Message Persistence:** Storing and retrieving messages within chat sessions
- **Data Integrity:** Ensuring chat data is correctly associated with projects and users
- **Context Provision:** Providing conversation history to other services

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Chat Endpoints
- `GET /projects/{project_id}/chats` - List all chat sessions for a project
- `POST /projects/{project_id}/chats` - Create a new chat session for a project
- `GET /chats/{chat_id}` - Get a specific chat session by ID
- `DELETE /chats/{chat_id}` - Delete a chat session

### Message Endpoints
- `GET /chats/{chat_id}/messages` - List messages for a chat session
- `POST /chats/{chat_id}/messages` - Add a new message to a chat session
- `GET /messages/{message_id}` - Get a specific message by ID

## Data Models

### Chat
```
{
  "id": "string",
  "projectId": "string",
  "title": "string",
  "createdAt": "string", // ISO date string
  "updatedAt": "string"  // ISO date string
}
```

### Message
```
{
  "id": "string",
  "chatId": "string",
  "content": "string",
  "role": "user" | "assistant" | "system",
  "timestamp": "string", // ISO date string
  "toolCalls": [
    {
      "id": "string",
      "toolName": "string",
      "parameters": {}, // JSON object
      "status": "pending" | "running" | "completed" | "failed"
    }
  ],
  "toolResults": [
    {
      "toolCallId": "string",
      "result": {}, // JSON object
      "error": "string" // Optional
    }
  ]
}
```

## Technology Stack

- **Framework:** FastAPI
- **Database:** Cloud Firestore
- **Authentication:** Firebase Auth
- **Docker Container:** For deployment on Cloud Run

## Environment Variables

- `GCP_PROJECT_ID` - Google Cloud Project ID
- `GCP_LOCATION` - Google Cloud region (default: "us-central1")
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` - Path to Firebase service account key file (local dev only)
- `CORS_ORIGINS` - Comma-separated list of allowed origins for CORS

## Local Development

1. Set up environment variables:
   ```
   export GCP_PROJECT_ID=your-project-id
   export FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-key.json
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the service:
   ```
   uvicorn app.main:app --reload
   ```

## Building and Deploying

### Build Docker Image
```
docker build -t gcr.io/[PROJECT_ID]/chat-service .
```

### Push to Container Registry
```
docker push gcr.io/[PROJECT_ID]/chat-service
```

### Deploy to Cloud Run
```
gcloud run deploy chat-service \
  --image gcr.io/[PROJECT_ID]/chat-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
``` 