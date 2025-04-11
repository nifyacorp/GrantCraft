# Code Summary for GrantCraft Service

Based on an analysis of the source code in the `services` directory, here's a summary of the GrantCraft service's functionality:

The project, likely named "GrantCraft", is a web application built with a microservices architecture using Python (FastAPI) and appears designed for deployment on Google Cloud Platform (GCP). It aims to assist users in preparing grant proposals.

**Core Components:**

1.  **`api-gateway`**:
    *   Acts as the main entry point for incoming requests.
    *   Handles user authentication using Firebase Authentication, verifying JWT tokens.
    *   Routes requests to the appropriate downstream microservice based on the URL path (e.g., `/users` routes to `user-service`, `/files` to `file-service`).
    *   Injects user identity information into requests before forwarding them to other services.
    *   Manages Cross-Origin Resource Sharing (CORS) policies.

2.  **`user-service`**:
    *   Manages user profile information.
    *   Provides endpoints to get the current user's profile, get profiles by ID, update profiles, and update user settings.
    *   Handles user creation implicitly on the first login if a profile doesn't exist in its database.
    *   Includes internal endpoints for other services to fetch user data.

3.  **`chat-service`**:
    *   Provides real-time or persistent chat functionality.
    *   Allows creating, listing, retrieving, and deleting chat sessions associated with specific projects.
    *   Manages messages within chat sessions (creating, listing, retrieving).
    *   Likely used for collaboration or interaction related to grant projects.

4.  **`file-service`**:
    *   Manages files associated with projects.
    *   Stores file metadata (name, type, creator, timestamps, etc.) in a database.
    *   Interacts with a cloud storage service (like Google Cloud Storage) for actual file storage.
    *   Provides endpoints to list files for a project, get file metadata, generate secure URLs for uploading and downloading file content, update file metadata, and delete files (both metadata and storage object).
    *   Includes access control checks to ensure users can only access files they are permitted to.

5.  **`agent-service`**:
    *   Implements an AI-powered agent to assist with grant proposal tasks.
    *   Uses Google Cloud Vertex AI (specifically mentioning the Gemini model) as its underlying AI engine.
    *   Defines several specialized "tools" that the agent can use:
        *   `DocumentGenerationTool`: Generates documents.
        *   `ResearchTool`: Performs research tasks.
        *   `FileManagementTool`: Interacts with file storage.
        *   `TimelineGenerationTool`: Creates project timelines.
        *   `BudgetGenerationTool`: Creates budgets.
        *   `ImageGenerationTool`: Generates images.
    *   Features a `ToolRouter` that intelligently selects the appropriate tool(s) based on the user's request/task.
    *   Can determine a sequence of tool calls needed to fulfill a complex task, likely using the AI model for planning.
    *   Processes requests containing a task description, user ID, and project ID, orchestrates the selected tools, and returns the results.

**Overall Functionality:**

The system provides a platform for users to manage grant proposal projects. Users can manage their profiles, upload/download project-related files, communicate via chat, and leverage an AI agent to automate or assist with various aspects of grant writing, such as document drafting, research, budget creation, and timeline planning. Authentication is centralized at the gateway, and individual services handle specific domain logic. 