# GrantCraft Microservices Architecture & Folder Structure

This document outlines a potential microservice architecture for the GrantCraft system, designed to modularize functionality and facilitate focused development and specification.

## 1. Microservice Architecture Overview

Instead of a single large backend application, the system's backend logic can be decomposed into several independent services, each responsible for a distinct domain. This allows for independent scaling, deployment, and development.

**High-Level Interaction:**

```mermaid
graph TD
    User[User] --> FE[Frontend (Cloud Run)];
    FE --> GW[API Gateway (Cloud Run)];

    subgraph Backend Microservices
        GW -->|/users/**| US(UserService);
        GW -->|/projects/**| PS(ProjectService);
        GW -->|/chats/**| CS(ChatService);
        GW -->|/files/**| FS(FileService);
        GW -->|/tasks/**| TS(TaskService);
        GW -->|/agent/**| AS(AgentService);

        AS -->|Vertex AI API| VertexAI[(Vertex AI)];
        AS -->|Internal API| CS;
        AS -->|Internal API| TS;
        AS -->|Internal API| FS;
        AS -->|Needs Project Info| PS;

        US --> DB[(Firestore)];
        PS --> DB;
        CS --> DB;
        FS --> DB;
        FS --> Storage[(Cloud Storage)];
        TS --> DB;
    end

    FE --> Auth[(Firebase Auth)];
    GW --> Auth;
    US --> Auth;

```
*Note: Arrows indicate primary request flows. Services might communicate internally via synchronous APIs (e.g., gRPC, REST) or asynchronously (e.g., Pub/Sub events) depending on the specific interaction.*

## 2. Proposed Microservices

Here are the proposed microservices, each potentially running as a separate Cloud Run instance:

1.  **`Frontend`**
    *   **Technology:** Next.js
    *   **Responsibilities:** User Interface, component rendering, state management, interaction with Firebase Auth for sign-in, interaction with the `API Gateway`.
    *   **Folder:** `frontend/`

2.  **`API Gateway`**
    *   **Technology:** FastAPI (or potentially Cloud Functions)
    *   **Responsibilities:** Public-facing entry point for the backend. Handles incoming requests from the `Frontend`. Validates Firebase Auth tokens. Routes requests to the appropriate internal microservice based on the URL path. Aggregates responses if needed. Enforces rate limiting. Handles CORS.
    *   **Folder:** `services/api-gateway/`

3.  **`UserService`**
    *   **Technology:** FastAPI (or similar)
    *   **Responsibilities:** Manages user profiles, user settings, potentially user roles (though permissions might be more project-specific). Interacts with Firestore (`users` collection) and potentially Firebase Auth for user metadata.
    *   **Folder:** `services/user-service/`

4.  **`ProjectService`**
    *   **Technology:** FastAPI (or similar)
    *   **Responsibilities:** Manages projects (creation, retrieval, updates, deletion), collaborators, project-level permissions, and project metadata. Interacts with Firestore (`projects` collection).
    *   **Folder:** `services/project-service/`

5.  **`ChatService`**
    *   **Technology:** FastAPI (or similar)
    *   **Responsibilities:** Manages chat sessions and message persistence. Handles creation, retrieval, and potentially updates/deletions of chat messages. Interacts with Firestore (`chats`, `messages` collections). Might offer streaming endpoints for real-time chat updates.
    *   **Folder:** `services/chat-service/`

6.  **`FileService`**
    *   **Technology:** FastAPI (or similar)
    *   **Responsibilities:** Manages file metadata (stored in Firestore `files` collection). Handles interactions with Cloud Storage for blob uploads and downloads. Generates signed URLs for secure client-side access.
    *   **Folder:** `services/file-service/`

7.  **`TaskService`**
    *   **Technology:** FastAPI (or similar)
    *   **Responsibilities:** Manages tasks, subtasks, dependencies, status updates, and assignments. Interacts with Firestore (`tasks` collection). May receive requests from the `AgentService` to create tasks based on decomposition.
    *   **Folder:** `services/task-service/`

8.  **`AgentService`**
    *   **Technology:** FastAPI (or similar)
    *   **Responsibilities:** Contains the core AI logic. Manages conversation context (potentially retrieving history from `ChatService`). Handles prompt engineering and management. Interacts with Vertex AI (Gemini models). Orchestrates tool selection and execution, calling internal APIs of other services (`FileService`, `TaskService`, potentially `ProjectService` for context) as needed. Parses responses from Vertex AI and other services.
    *   **Folder:** `services/agent-service/` (with subfolders for `tools/` and `prompts/`)

## 3. Proposed Monorepo Folder Structure

A monorepo structure can help manage dependencies and consistency across services.
grant-craft/
├── services/ # Backend microservices
│ ├── api-gateway/
│ │ ├── app/ # Service code (e.g., FastAPI app)
│ │ ├── tests/ # Unit/integration tests
│ │ └── Dockerfile # Container definition
│ ├── user-service/
│ │ ├── app/
│ │ ├── tests/
│ │ └── Dockerfile
│ ├── project-service/
│ │ ├── app/
│ │ ├── tests/
│ │ └── Dockerfile
│ ├── chat-service/
│ │ ├── app/
│ │ ├── tests/
│ │ └── Dockerfile
│ ├── agent-service/
│ │ ├── app/
│ │ │ ├── tools/ # Implementations of AI tools
│ │ │ └── prompts/ # Prompt templates and management
│ │ ├── tests/
│ │ └── Dockerfile
│ ├── file-service/
│ │ ├── app/
│ │ ├── tests/
│ │ └── Dockerfile
│ ├── task-service/
│ │ ├── app/
│ │ ├── tests/
│ │ └── Dockerfile
│ └── ... (potential future services: notification, search, etc.)
│
├── frontend/ # Frontend application
│ ├── src/ # Next.js source code
│ ├── public/ # Static assets
│ ├── package.json
│ ├── next.config.js
│ └── Dockerfile # Container definition
│
├── shared/ # Shared code/types across services
│ ├── libs/ # Shared libraries (e.g., common utils)
│ └── types/ # Shared data structures (e.g., Pydantic models, TypeScript types)
│
├── infrastructure/ # Infrastructure as Code (IaC)
│ ├── gcp/ # GCP resource definitions (Terraform, Pulumi, etc.)
│ └── firebase/ # Firebase config (rules, indexes)
│
├── docs/ # Project documentation (like the reviewed files)
│ ├── architecture/
│ ├── api/ # API specifications
│ └── design/
│
├── .gitignore
├── README.md # Main project readme
└── poetry.lock # (If using Poetry for Python services)
└── pyproject.toml # (If using Poetry for Python services)
└── package.json # (For monorepo tooling like Lerna/Nx, if used)


This structure separates concerns, allowing you to focus on the specifications for one service (e.g., `AgentService`) in a subsequent request, referencing its interactions with others via defined APIs or events.