# GrantCraft Execution Plan

This document outlines a detailed execution plan for implementing the GrantCraft system. The plan assumes an incremental development approach, starting with core functionality and progressively adding more features.

## MVP Definition and Scope

Before proceeding with the detailed execution plan, we need to clearly define the scope of our Minimum Viable Product (MVP). The MVP will focus on a single core workflow:

1. User authentication (login/signup)
2. Project creation and management
3. Basic chat interface with AI assistant
4. Document generation for a single proposal section type (e.g., project summary)
5. File storage and retrieval

### MVP Features and Limitations

The MVP will specifically include:

- Firebase authentication with Google Sign-In only
- Basic project creation (title, description, deadline)
- Simple chat interface with conversation history
- Single AI tool: Document Generation Tool (for creating proposal text sections)
- Basic file storage, viewing, and downloading
- Minimal styling and UX polish

The MVP will explicitly NOT include:

- Collaboration features (sharing, multi-user editing)
- Advanced AI tools (image generation, complex research, etc.)
- Budget or timeline generation tools
- Task management and decomposition
- Custom templates or advanced formatting options
- External system integrations

### Revised MVP Timeline

The revised MVP timeline is 10 weeks (not 7), broken down as:

- Weeks 1-2: Project setup, infrastructure, authentication
- Weeks 3-4: Core frontend and backend implementation
- Weeks 5-6: AI integration with Vertex AI and document generation
- Weeks 7-8: File management and storage
- Weeks 9-10: Testing, bug fixing, and deployment

This timeline acknowledges the complexity of setting up Google Cloud services, implementing proper authentication, and integrating with Vertex AI.

## Phase 1: System Setup and Infrastructure

### 1.1 Google Cloud Project Setup
- Create GCP project "grant-craft-app"
- Enable required APIs:
  - Cloud Build
  - Cloud Run
  - Artifact Registry
  - Firebase
  - Firestore
  - Vertex AI
  - Secret Manager
- Configure billing alerts and quotas

### 1.2 Firebase Configuration
- Set up Firebase project
- Configure Authentication with Google Sign-In
- Create Firestore database in production mode
- Define initial security rules for Firestore

### 1.3 Cloud Storage Setup
- Create storage bucket "grant-craft-files"
- Configure access controls and CORS settings
- Set up proper folder structure (users/{userId}/projects/{projectId}/)

### 1.4 Development Environment
- Initialize Git repository
- Set up frontend project with Next.js
- Set up backend project with FastAPI + Poetry
- Configure local environment variables
- Create CI/CD pipelines

## Phase 2: Core Backend Services

### 2.1 Authentication Service
- Implement Firebase Auth integration
- Create user profile management
- Set up session handling
- Implement middleware for request authentication

### 2.2 Database Models Implementation
- Implement Firestore data models:
  - User model
  - Project model
  - Chat model
  - Message model
  - Task model
  - File model
- Create schema validation utilities
- Implement data access layer with proper error handling

### 2.3 File Service Implementation
- Create Cloud Storage client integration
- Implement file upload functionality
- Implement file download functionality
- Implement file listing and browsing
- Create file metadata management

### 2.4 Vertex AI Integration
- Set up Vertex AI client
- Implement prompt management system
- Create base AI service with error handling
- Implement chat message handling
- Set up structured output parsing

## Phase 3: Core Frontend Development

### 3.1 Authentication Components
- Create login screen
- Implement authentication flow
- Add user profile components
- Set up protected routes

### 3.2 Chat Interface
- Build chat container component
- Implement message rendering
- Create message input component
- Add message history loading
- Implement real-time message updates

### 3.3 File Browser Components
- Create file browser layout
- Implement file listing component
- Add file upload component
- Create file preview component
- Implement file operations UI (rename, delete, etc.)

### 3.4 Core UI Elements
- Create navigation components
- Implement responsive layout system
- Design and implement UI theme
- Create loading states and error handling components

## Phase 4: MVP Tool Implementation

### 4.1 AI Tool Framework
- Create base tool class structure
- Implement tool registration system
- Set up tool parameter validation
- Create tool execution pipeline
- Implement result handling

### 4.2 Document Generation Tool
- Implement structured text generation
- Create template-based document creation
- Add formatting options
- Implement section-specific generation
- Set up response parsing and cleaning

### 4.3 Research Tool (Basic Version)
- Implement research query processing
- Create response summarization
- Add structured research results output
- Implement citation formatting

### 4.4 Basic Task Decomposition Tool
- Create task breakdown logic
- Implement dependency identification
- Add task storage and retrieval
- Create task status management

## Phase 5: Integration and Basic Workflow

### 5.1 Chat-Tool Integration
- Connect chat interface to tool system
- Implement tool selection in chat flow
- Create tool execution visualization
- Add tool results display in chat

### 5.2 Project Management
- Implement project creation flow
- Add project listing and selection
- Create project settings management
- Connect projects to chats and files

### 5.3 Basic Workflow Implementation
- Create guided workflow for new grant proposals
- Implement proposal section templates
- Add progress tracking
- Create document compilation logic

### 5.4 User Flow Design

The MVP will implement the following core user flows:

```
1. Authentication Flow:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Login Page │ ──> │ Google Auth │ ──> │ Dashboard   │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘

2. Project Creation Flow:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │   Project   │     │             │
│  Dashboard  │ ──> │  Creation   │ ──> │Project Home │
│             │     │    Form     │     │             │
└─────────────┘     └─────────────┘     └─────────────┘

3. Document Generation Flow:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │    Tool     │     │             │
│Project Home │ ──> │ Chat Window │ ──> │  Execution  │ ──> │ File Viewer │
│             │     │             │     │    State    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                         │                                        │
                         │                                        │
                         ▼                                        ▼
                    ┌─────────────┐                         ┌─────────────┐
                    │   Follow-up │                         │   Download  │
                    │   Messages  │ ◀────────────────────── │    File    │
                    │             │                         │             │
                    └─────────────┘                         └─────────────┘
```

For complex operations like document generation, the chat interface will communicate the progress state to the user. A hybrid approach allows:

1. Chat interface initiates the action through natural language
2. Tool execution shows a visual progress indicator
3. Results (e.g., generated documents) appear in the file browser
4. User can continue chat conversation about the document or download the file

This flow integrates the core MVP components (chat, file management, AI document generation) while maintaining a simple, intuitive user experience.

### 5.5 End-to-End Testing
- Test complete user workflows
- Verify data persistence
- Validate tool execution
- Test error handling and recovery

## Phase 6: Advanced Tools Implementation

### 6.1 Timeline Generation Tool
- Implement timeline data structure
- Create Gantt chart generation
- Add milestone management
- Implement timeline visualization
- Create timeline export functionality

### 6.2 Budget Generation Tool
- Implement budget data structure
- Create itemized budget generation
- Add budget calculations
- Implement budget justification generation
- Create budget formatting options

### 6.3 Image Generation Tool
- Implement diagram generation prompts
- Create chart data structure
- Add visualization rendering
- Implement image storage and retrieval
- Create image manipulation options

### 6.4 Literature Review Tool
- Implement academic paper search
- Create paper summarization
- Add citation extraction
- Implement literature review compilation
- Create bibliography generation

## Phase 7: UI/UX Refinement

### 7.1 Enhanced Chat Experience
- Improve message rendering
- Add message reactions and feedback
- Implement context awareness
- Create suggestion chips
- Add typing indicators

### 7.2 Task Management UI
- Create task board component
- Implement drag-and-drop functionality
- Add task filtering and sorting
- Create task details view
- Implement task assignment UI

### 7.3 Document Editing Interface
- Create in-browser document editor
- Implement formatting toolbar
- Add collaborative editing markers
- Create version history viewer
- Implement document export options

### 7.4 Dashboard and Analytics
- Create user dashboard
- Implement project overview
- Add usage statistics
- Create progress visualization
- Implement deadline tracking

## Phase 8: System Requirements Documentation

### 8.1 Deployment Requirements
- Document Cloud Run configuration requirements
- List required environment variables
- Specify scaling parameters
- Document service dependencies
- Outline infrastructure requirements

### 8.2 Frontend Build Requirements
- Document build process requirements
- Specify Firebase Hosting configuration needs
- List required environment variables
- Document CDN and caching requirements
- Specify analytics configuration

### 8.3 Monitoring Requirements
- Document recommended monitoring metrics
- Specify logging requirements
- Outline alert policy recommendations
- Document error reporting needs

### 8.4 Security Requirements
- Document authentication requirements
- Specify Firestore security rule requirements
- List API endpoint protection measures
- Document credential management best practices
- Outline security testing recommendations

## Phase 9: Extended Features

### 9.1 Collaboration Features
- Implement user invitation system
- Create permission management
- Add real-time collaboration
- Implement commenting system
- Create activity feed

### 9.2 Advanced Document Management
- Implement document templates library
- Create custom template builder
- Add version control system
- Implement document comparison
- Create document annotation

### 9.3 AI Customization
- Create custom prompt library
- Implement institutional boilerplate
- Add style preference system
- Create saved elements library
- Implement custom templates

### 9.4 External Integrations
- Create API for external tools
- Implement OAuth for third-party services
- Add reference management integration
- Create citation service integration
- Implement calendar integration

## Phase 10: Core Infrastructure Elements

### 10.1 Error Handling Strategy
- Implement standardized error handling across the system
- Create error response models for API endpoints
- Implement API input validation with Pydantic models
- Add client-side error handling and user feedback mechanisms
- Create error recovery strategies for different failure types:
  - Connectivity issues
  - Authentication failures
  - API errors
  - Vertex AI service issues
  - Database errors

### 10.2 Testing Strategy
- Implement unit testing for backend services
  - Use pytest for Python backend
  - Test critical business logic and API endpoints
  - Mock external services (Vertex AI, Firebase)
- Implement frontend testing
  - Component testing with React Testing Library
  - Integration tests for key user flows
- End-to-end testing
  - Create automated test scripts for core user journeys
  - Test cross-component interactions

### 10.3 Logging and Monitoring
- Implement structured logging
  - Use Cloud Logging for centralized log management
  - Define log severity levels and message formats
  - Log key application events and errors
- Set up application monitoring
  - Create custom metrics for key performance indicators
  - Monitor API performance and error rates
  - Track Vertex AI usage and costs
  - Set up alerts for critical issues
- Implement user analytics
  - Track feature usage and performance
  - Identify bottlenecks and optimization opportunities

### 10.4 Cost Management
- Implement cost monitoring and reporting
  - Set up billing alerts and budgets
  - Monitor resource usage and costs by service
- Implement cost optimization strategies
  - Cache AI responses where appropriate
  - Optimize Vertex AI prompt design for token efficiency
  - Implement tiered storage for infrequently accessed files
  - Configure appropriate autoscaling parameters

### 10.5 Security Implementation
- Implement secure API design
  - Input validation on all endpoints
  - Rate limiting for API calls
  - Protection against common web vulnerabilities
- Set up proper authorization
  - Implement role-based access control
  - Secure Cloud Storage access with signed URLs
  - Validate permissions for all operations
- Implement secure secrets management
  - Use Secret Manager for all sensitive configuration
  - Rotate credentials regularly
  - Limit secret access to necessary services

## Implementation Details

### Backend Structure

```
backend/
├── app/
│   ├── api/           # API routes and endpoints
│   ├── core/          # Core configurations
│   ├── db/            # Database models and utilities
│   ├── services/      # Service implementations
│   │   └── ai/        # AI services and tools
│   └── main.py        # Main application entry point
├── tests/             # Test modules
└── pyproject.toml     # Project dependencies
```

### Frontend Structure

```
frontend/
├── public/            # Static assets
├── src/
│   ├── components/    # React components
│   ├── contexts/      # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Next.js pages
│   ├── services/      # API services
│   ├── styles/        # CSS and styling
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── next.config.js     # Next.js configuration
└── package.json       # Project dependencies
```

### Data Models

#### User Model
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  settings: {
    theme: string;
    notifications: boolean;
  };
}
```

#### Project Model
```typescript
interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'active' | 'archived' | 'completed';
  collaborators: {
    userId: string;
    role: 'editor' | 'viewer';
  }[];
  metadata: {
    fundingSource?: string;
    deadline?: Timestamp;
    budget?: number;
    category?: string;
  };
}
```

#### Chat Model
```typescript
interface Chat {
  id: string;
  projectId: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  messages: Message[];
}

interface Message {
  id: string;
  chatId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Timestamp;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface ToolResult {
  toolCallId: string;
  result: any;
  error?: string;
}
```

#### Task Model
```typescript
interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dueDate?: Timestamp;
  assignedTo?: string;
  parentId?: string;
  dependencies: string[];
  metadata: Record<string, any>;
}
```

#### File Model
```typescript
interface File {
  id: string;
  projectId: string;
  name: string;
  path: string;
  type: 'document' | 'image' | 'spreadsheet' | 'other';
  mimeType: string;
  size: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  url: string;
  metadata: Record<string, any>;
}
```

## Tool Implementations

### Document Generation Tool

The Document Generation Tool will:
1. Accept parameters for topic, section type, requirements, and style
2. Generate structured text content using Vertex AI
3. Format the output according to specified templates
4. Handle various section types (introduction, methodology, background, etc.)
5. Support academic citation formatting

Implementation approach:
- Build a robust prompt template system
- Create section-specific templates with appropriate guidelines
- Implement post-processing for formatting cleanup
- Add citation generation capability
- Enable document saving to Cloud Storage

### Research Tool

The Research Tool will:
1. Process research queries about topics, methodologies, or funding
2. Generate structured research summaries
3. Provide citations and references
4. Identify key concepts and trends
5. Analyze potential funding sources

Implementation approach:
- Create specialized prompts for different research needs
- Implement structured output parsing for consistent results
- Add citation validation and formatting
- Create specialized funding source database prompts
- Implement summary generation with key points

### Timeline Generation Tool

The Timeline Tool will:
1. Generate project timelines based on project descriptions
2. Create milestone and task breakdowns
3. Calculate realistic durations
4. Identify dependencies between tasks
5. Generate visualization data

Implementation approach:
- Implement timeline data structure with task dependencies
- Create prompt templates for timeline extraction
- Add validation for timeline consistency
- Implement export to various formats
- Create visualization data transformation

### Budget Generation Tool

The Budget Tool will:
1. Generate itemized budgets based on project requirements
2. Estimate costs for personnel, equipment, and expenses
3. Create budget justifications
4. Format according to funding agency requirements
5. Calculate indirect costs

Implementation approach:
- Create budget templates for different project types
- Implement cost estimation logic
- Add budget category management
- Create justification generation
- Implement export formats

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Projects Endpoints
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Chat Endpoints
- `GET /api/projects/{projectId}/chats` - List project chats
- `POST /api/projects/{projectId}/chats` - Create new chat
- `GET /api/chats/{chatId}/messages` - Get chat messages
- `POST /api/chats/{chatId}/messages` - Send new message
- `GET /api/chats/{chatId}/tools` - List available tools
- `POST /api/chats/{chatId}/tools/{toolName}` - Execute tool

### Files Endpoints
- `GET /api/projects/{projectId}/files` - List project files
- `POST /api/projects/{projectId}/files` - Upload file
- `GET /api/files/{fileId}` - Get file metadata
- `GET /api/files/{fileId}/content` - Download file
- `PUT /api/files/{fileId}` - Update file metadata
- `DELETE /api/files/{fileId}` - Delete file

### Tasks Endpoints
- `GET /api/projects/{projectId}/tasks` - List project tasks
- `POST /api/projects/{projectId}/tasks` - Create new task
- `GET /api/tasks/{taskId}` - Get task details
- `PUT /api/tasks/{taskId}` - Update task
- `DELETE /api/tasks/{taskId}` - Delete task
- `POST /api/projects/{projectId}/decompose` - Decompose project into tasks

## AI Implementation Considerations

Since the implementation will be performed by AI rather than human developers, these special considerations apply:

- **Prompt Engineering Focus**: Significant attention will be given to creating high-quality, reusable prompt templates for each tool
- **Progressive Code Generation**: Code will be generated in logical, buildable chunks rather than through traditional sprint planning
- **Context Management**: Special care will be taken to maintain context across implementation sessions
- **Documentation Generation**: Documentation will be generated alongside code implementation
- **Error Handling Patterns**: Comprehensive error handling will be implemented from the start
- **Testing Approach**: Tests will be generated alongside implementation code

## Implementation Flow

The implementation will follow this general pattern for each component:

1. Define data structures and interfaces
2. Implement core functionality
3. Add proper error handling and validation
4. Create unit tests for the component
5. Document the component API and usage
6. Integrate with other components

This process will be iterative, with continuous refinement as implementation progresses. 