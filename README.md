# GrantCraft

GrantCraft is a cloud-based application built on Google Cloud Platform that helps users prepare research grant proposals with AI assistance.

## Overview

This system uses a microservices architecture deployed on Google Cloud Platform. The currently implemented components are:

- **Frontend:** A Next.js application providing the user interface, deployed on Cloud Run.
- **API Gateway:** A FastAPI service acting as the entry point for API requests, handling routing and authentication (using Firebase Auth), deployed on Cloud Run.
- **Chat Service:** A FastAPI service managing chat sessions and messages for projects, using Cloud Firestore for persistence, deployed on Cloud Run.
- **File Service:** A FastAPI service managing file metadata (in Cloud Firestore) and interaction with Cloud Storage for file uploads/downloads, deployed on Cloud Run.
- **Database:** Cloud Firestore is used for persistent storage by the Chat and File services.
- **Storage:** Cloud Storage is used for storing uploaded files.

*Note: The User, Project, Task, and Agent services are defined in the structure but are not yet implemented.*

## Project Structure

- `services/`: Backend microservices
  - `api-gateway/`: Entry point for API requests (Implemented)
  - `chat-service/`: Chat session and message persistence (Implemented)
  - `file-service/`: File metadata and storage management (Implemented)
  - `user-service/`: User profile management (Not Implemented)
  - `project-service/`: Project lifecycle management (Not Implemented)
  - `task-service/`: Task management and tracking (Not Implemented)
  - `agent-service/`: AI agent and tools (Not Implemented)
- `frontend/`: Next.js application for user interface (Implemented)
- `shared/`: Shared TypeScript code and types (interfaces for auth, chat, file, project, task)
- `infrastructure/`: Infrastructure definitions (GCP, Firebase)
- `docs/`: Additional documentation files

## Getting Started

See [GETTING-STARTED.md](GETTING-STARTED.md) for setup instructions.

## Implemented Features

GrantCraft currently provides the following core features based on the implemented services:

- User authentication via Firebase.
- API routing and request forwarding.
- Creation, retrieval, and deletion of chat sessions per project.
- Sending and retrieving messages within chat sessions.
- Management of file metadata associated with projects.
- Generation of secure URLs for direct file uploads to Cloud Storage.
- Generation of secure URLs for direct file downloads from Cloud Storage.
- Deletion of files (metadata and storage).

*Features like AI assistance, document generation, and task management are planned but not yet implemented.*

## Documentation

See the `docs/` directory and other `README-*.md` files for more detailed documentation on specific components. 