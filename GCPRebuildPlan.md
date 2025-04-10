# GrantCraft Rebuild Plan for Google Cloud

This document outlines the plan to rebuild the GrantCraft system as a Google Cloud-based application that helps users prepare research grant proposals with AI assistance.

## System Overview

The rebuilt system will maintain the core functionality of the original:
- Chat interface for user-AI interaction
- Task decomposition for complex research proposals
- File management for proposal documents
- Tool selection for AI operations

## Architecture Diagram

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

## Component Breakdown

### 1. Frontend (Next.js)

#### Key Features:
- Chat interface with message history
- Task display and tracking
- File browser for document management
- Responsive design for all devices

#### Google Cloud Implementation:
- Deploy on Cloud Run
- Use Firebase Auth for authentication
- Connect to backend via REST API

### 2. Backend (FastAPI)

#### Key Features:
- AI agent management
- Task execution
- File operations
- Integration with LLM services

#### Google Cloud Implementation:
- Deploy on Cloud Run
- Use Vertex AI for LLM services
- Connect to Cloud Firestore for data persistence
- Use Cloud Storage for file management

### 3. Database (Cloud Firestore)

#### Collections:
- Users
- Chats
- Tasks
- Files
- Tools

### 4. Storage (Cloud Storage)

- Store user-generated files
- Organize by user/project structure
- Handle permissions via Firebase Auth

### 5. AI Services (Vertex AI)

- Use Google's Gemini models for LLM capabilities
- Implement agents using Vertex AI's capabilities
- Support tool use and function calling

## Implementation Plan

### Phase 1: Setup and Infrastructure

1. Create Google Cloud Project
2. Set up Firebase project
3. Configure Cloud Storage buckets
4. Set up Firestore database
5. Create basic CI/CD pipelines

### Phase 2: Frontend Development

1. Create basic Next.js application
2. Implement authentication with Firebase
3. Build chat interface
4. Develop task list component
5. Create file browser component
6. Connect to backend API

### Phase 3: Backend Development

1. Create FastAPI application structure
2. Implement agent management system
3. Connect to Vertex AI
4. Build task decomposition service
5. Implement file operations
6. Create tool integration system

### Phase 4: Integration and Testing

1. Connect frontend to backend
2. Test end-to-end functionality
3. Implement error handling
4. Optimize performance
5. Test with real use cases

### Phase 5: Deployment and Launch

1. Deploy to Cloud Run
2. Set up monitoring and logging
3. Configure scaling and performance settings
4. Document the system
5. Launch MVP

## Tools and Features

For the MVP, the AI agent will have access to a single core tool:

1. File Creation - Generate text documents for proposal sections

Additional tools planned for future phases (not in MVP):
1. Image Generation - Create charts, diagrams, and visuals
2. Web Search - Research topics and gather information
3. Task Management - Break down complex tasks
4. Document Analysis - Analyze research papers or grant requirements
5. Timeline Creation - Generate project timelines and Gantt charts
6. Budget Generation - Create itemized budgets with justifications

## Detailed Component Specifications

### Frontend Components

1. ChatWindow - Displays conversation with AI
2. TaskList - Shows decomposed tasks with status
3. FileBrowser - Manages proposal documents
4. ToolSelector - Allows user to suggest tools for AI to use
5. AuthComponent - Handles user authentication

### Backend Services

1. AgentService - Manages AI agent behavior
2. TaskService - Handles task creation and management
3. FileService - Manages file operations
4. ToolService - Provides tools for the AI agent
5. AuthService - Handles authentication and permissions

## Estimated Timeline

- Phase 1: 2 weeks
- Phase 2: 2 weeks
- Phase 3: 2 weeks
- Phase 4: 2 weeks
- Phase 5: 2 weeks

Total: ~10 weeks for MVP

## Next Steps

1. Set up Google Cloud Project
2. Create basic project structure
3. Start with authentication implementation
4. Begin frontend development 