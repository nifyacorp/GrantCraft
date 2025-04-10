# GrantCraft System Architecture and Service Overview

## System Architecture Overview

GrantCraft is a cloud-based application built on Google Cloud Platform that helps users prepare research grant proposals with AI assistance. This document provides a high-level overview of the system's architecture, service relationships, and feature set.

## Architectural Components

```
+----------------------------+       +----------------------------+
|                            |       |                            |
|   Frontend                 |       |   Backend                  |
|   (Next.js on Cloud Run)   +------>+   (FastAPI on Cloud Run)   |
|                            |       |                            |
+-------------+--------------+       +-------------+--------------+
              |                                    |
              |                                    |
              v                                    v
+----------------------------+       +----------------------------+
|                            |       |                            |
|   Authentication           |       |   LLM Services            |
|   (Firebase Auth)          |       |   (Vertex AI)             |
|                            |       |                            |
+----------------------------+       +----------------------------+
              |                                    |
              |                                    |
              v                                    v
+----------------------------+       +----------------------------+
|                            |       |                            |
|   Database                 |       |   Storage                 |
|   (Cloud Firestore)        |       |   (Cloud Storage)         |
|                            |       |                            |
+----------------------------+       +----------------------------+
```

## Service Relationships & Communication Patterns

### Frontend ↔ Backend
- **Protocol**: REST API with JSON payloads
- **Authentication**: JWT tokens via Firebase Authentication
- **Communication Pattern**: Synchronous HTTP requests 
- **Key Interactions**:
  - User authentication/session management
  - Chat message exchange
  - Task management operations
  - File operations (upload/download/listing)
  - Tool execution requests

### Backend ↔ LLM Services
- **Protocol**: Google Vertex AI API
- **Communication Pattern**: Synchronous API calls with streaming responses for chat
- **Key Interactions**:
  - Chat message processing
  - Task decomposition
  - Tool function calling
  - Document generation

### Backend ↔ Database
- **Protocol**: Firestore SDK
- **Communication Pattern**: Asynchronous document operations
- **Data Models**:
  - Users - User profiles and settings
  - Chats - Conversation history
  - Tasks - Task definitions and status
  - Files - File metadata
  - Tools - Tool definitions and configurations

### Backend ↔ Storage
- **Protocol**: Cloud Storage SDK
- **Communication Pattern**: Object storage operations
- **Key Interactions**:
  - File upload/download
  - Document generation results
  - Resource attachment storage

### Frontend ↔ Authentication
- **Protocol**: Firebase Authentication SDK
- **Communication Pattern**: OAuth 2.0 flow
- **Authentication Methods**:
  - Email/Password
  - Google Sign-In
  - (Optional) Additional OAuth providers

## Core Services

### Frontend Services
1. **Authentication Service**
   - Handles user authentication and session management
   - Integrates with Firebase Authentication
   - Manages user profiles and settings

2. **Chat Service**
   - Manages the chat interface and message history
   - Handles message sending/receiving
   - Maintains conversation context

3. **Task Service**
   - Displays and manages task lists
   - Tracks task status and progress
   - Allows task creation, editing, and deletion

4. **File Service**
   - Provides file browser functionality
   - Handles file uploads and downloads
   - Manages file metadata and organization

5. **Tool Service**
   - Offers UI for tool selection
   - Shows tool execution status
   - Displays tool results

### Backend Services
1. **Agent Service**
   - Manages AI agent behavior and prompt engineering
   - Handles conversation context and memory
   - Orchestrates interactions with Vertex AI

2. **Task Service**
   - Performs task decomposition
   - Manages task dependencies
   - Updates task status and progress

3. **File Service**
   - Processes file operations
   - Manages file metadata in Firestore
   - Handles file storage in Cloud Storage

4. **Tool Service**
   - Implements tools for AI agent use
   - Processes tool execution requests
   - Validates tool inputs and outputs

5. **Auth Service**
   - Validates user authentication
   - Manages user permissions
   - Handles user profile data

## Database Schema (Firestore)

### Collections and Fields
1. **users**
   - `id`: string - Firebase Auth UID
   - `email`: string - User email (indexed)
   - `displayName`: string - User display name
   - `photoURL`: string - Profile photo URL
   - `createdAt`: timestamp - Account creation date
   - `lastLogin`: timestamp - Last login timestamp
   - `settings`: map
     - `theme`: string - UI theme preference
     - `notifications`: boolean - Notification settings
     - `defaultProjectId`: string - Default project to open

2. **projects**
   - `id`: string - Auto-generated project ID
   - `ownerId`: string - User ID of owner (indexed)
   - `title`: string - Project title (indexed)
   - `description`: string - Project description
   - `createdAt`: timestamp - Creation timestamp
   - `updatedAt`: timestamp - Last update timestamp
   - `status`: string - Status (active, archived, completed)
   - `metadata`: map
     - `fundingSource`: string - Target funding agency
     - `deadline`: timestamp - Project deadline
     - `budget`: number - Estimated budget
     - `category`: string - Project category
   - `collaborators`: array
     - `userId`: string - User ID of collaborator
     - `role`: string - Role (editor, viewer)
     - `addedAt`: timestamp - When collaborator was added

3. **chats**
   - `id`: string - Auto-generated chat ID
   - `projectId`: string - Associated project ID (indexed)
   - `title`: string - Chat title
   - `createdAt`: timestamp - Creation timestamp
   - `updatedAt`: timestamp - Last message timestamp

4. **messages**
   - `id`: string - Auto-generated message ID
   - `chatId`: string - Parent chat ID (indexed)
   - `content`: string - Message content
   - `role`: string - Message role (user, assistant, system)
   - `timestamp`: timestamp - Creation timestamp
   - `toolCalls`: array - Tool call records
     - `id`: string - Tool call ID
     - `toolName`: string - Name of tool called
     - `parameters`: map - Parameters passed to tool
     - `status`: string - Call status
   - `toolResults`: array - Tool results
     - `toolCallId`: string - Reference to tool call
     - `result`: map - Tool execution result
     - `error`: string - Error message if any

5. **tasks**
   - `id`: string - Auto-generated task ID
   - `projectId`: string - Associated project ID (indexed)
   - `title`: string - Task title
   - `description`: string - Task description
   - `status`: string - Status (pending, in_progress, completed, failed)
   - `priority`: string - Priority level (low, medium, high)
   - `createdAt`: timestamp - Creation timestamp
   - `updatedAt`: timestamp - Last update timestamp
   - `dueDate`: timestamp - Task due date
   - `assignedTo`: string - User ID of assignee
   - `parentId`: string - Parent task ID for subtasks
   - `dependencies`: array - IDs of tasks this task depends on
   - `metadata`: map - Additional task-specific data

6. **files**
   - `id`: string - Auto-generated file ID
   - `projectId`: string - Associated project ID (indexed)
   - `name`: string - File name (indexed)
   - `path`: string - Cloud Storage path
   - `type`: string - File type category
   - `mimeType`: string - MIME type
   - `size`: number - File size in bytes
   - `createdAt`: timestamp - Creation timestamp
   - `updatedAt`: timestamp - Last update timestamp
   - `createdBy`: string - User ID of creator
   - `metadata`: map - Additional file-specific data

### Indexes
- users: email
- projects: ownerId, title
- chats: projectId
- messages: chatId
- tasks: projectId, assignedTo
- files: projectId, name

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(resource) {
      return resource.data.ownerId == request.auth.uid;
    }
    
    function isCollaborator(resource) {
      return resource.data.collaborators.hasAny([request.auth.uid]);
    }
    
    function hasProjectAccess(projectId) {
      let project = get(/databases/$(database)/documents/projects/$(projectId));
      return isOwner(project) || isCollaborator(project);
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId);
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isSignedIn() && request.auth.uid == userId;
      allow delete: if false; // Prevent user deletion
    }
    
    // Projects
    match /projects/{projectId} {
      allow read: if isSignedIn() && (isOwner(resource) || isCollaborator(resource));
      allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
      allow update: if isSignedIn() && isOwner(resource);
      allow delete: if isSignedIn() && isOwner(resource);
    }
    
    // Chats
    match /chats/{chatId} {
      allow read, write: if isSignedIn() && hasProjectAccess(resource.data.projectId);
    }
    
    // Messages
    match /messages/{messageId} {
      allow read, write: if isSignedIn() && hasProjectAccess(get(/databases/$(database)/documents/chats/$(resource.data.chatId)).data.projectId);
    }
    
    // Tasks
    match /tasks/{taskId} {
      allow read, write: if isSignedIn() && hasProjectAccess(resource.data.projectId);
    }
    
    // Files
    match /files/{fileId} {
      allow read, write: if isSignedIn() && hasProjectAccess(resource.data.projectId);
    }
  }
}
```

### Cloud Storage Security

Files in Cloud Storage will be secured using Firebase Authentication and server-signed URLs:

1. Each file path will include the user ID and project ID: `{userId}/{projectId}/{filename}`
2. Default access will be restricted to authenticated users
3. The backend will generate signed URLs with expiration for file access
4. Direct file access will be denied without a valid signed URL

## AI Capabilities & Tools

The AI agent has access to the following tools:

1. **File Creation**
   - Generate structured text documents
   - Create proposal sections
   - Format documents according to templates

2. **Image Generation**
   - Create charts and diagrams
   - Generate data visualizations
   - Design visual elements for proposals

3. **Web Search**
   - Research relevant topics
   - Gather information from trusted sources
   - Cite sources appropriately

4. **Task Management**
   - Break down complex proposals into manageable tasks
   - Suggest task sequences and dependencies
   - Prioritize tasks based on deadlines

5. **Document Analysis**
   - Review and analyze research papers
   - Extract key information from grant requirements
   - Provide feedback on proposal drafts

6. **Timeline Creation**
   - Generate project timelines
   - Create Gantt charts
   - Manage project scheduling

## Deployment Architecture

### Google Cloud Resources
- **Cloud Run**
  - Frontend service (Next.js)
  - Backend service (FastAPI)
  
- **Firebase**
  - Authentication
  - Firestore database
  
- **Cloud Storage**
  - File storage for user documents
  - Asset storage for system resources
  
- **Vertex AI**
  - Gemini Pro model for agent capabilities
  - Model deployment and serving
  
- **Secret Manager**
  - API keys and secrets
  - Configuration values
  
- **Cloud Monitoring**
  - Application monitoring
  - Performance metrics
  - Alert policies

---

*Note: This document provides a conceptual overview of the system architecture and is subject to change as development progresses. For specific implementation details, refer to the codebase and technical documentation.* 