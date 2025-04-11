# GrantCraft Technical Design Document

This document provides detailed technical specifications for the GrantCraft system, including logical diagrams, class structures, methods, and test plans.

## Logical Architecture Diagram

```
+-------------------------------------------+
|                  CLIENT                   |
+-------------------------------------------+
| - NextJS Components                       |
| - React Hooks                             |
| - State Management (Zustand)              |
| - UI Components (Tailwind/Shadcn)         |
+----------------+------------------------+-+
                 |                        |
                 v                        v
+----------------+-------+    +-----------+-----------+
| Authentication Service |    | Frontend API Gateway  |
| (Firebase Auth)        |    | (Next.js API Routes)  |
+----------------+-------+    +-----------+-----------+
                 |                        |
                 v                        v
+----------------+------------------------+-+
|                  BACKEND                  |
+-------------------------------------------+
| +-------------------+  +----------------+ |
| | File Service      |  | Chat Service   | |
| | (FastAPI)         |  | (FastAPI)      | |
| +-------------------+  +----------------+ |
| +-------------------+  +----------------+ |
| | Task Service      |  | Tool Service   | |
| | (FastAPI)         |  | (FastAPI)      | |
| +-------------------+  +----------------+ |
| +-------------------+                     |
| | Agent Service     |                     |
| | (FastAPI)         |                     |
| +-------------------+                     |
+-------------------+-----+-----------------+
                    |     |
        +-----------+     +------------+
        |                              |
        v                              v
+-------+---------+          +---------+--------+
| Data Services   |          | External Services |
+-----------------+          +------------------+
| - Firestore     |          | - Vertex AI      |
| - Cloud Storage |          | - Web Search API |
+-----------------+          +------------------+
```

## Class Diagrams and Methods

### 1. Frontend Services

#### 1.1 Authentication Service Class Diagram

```
+----------------------+
| AuthService          |
+----------------------+
| - auth: FirebaseAuth |
+----------------------+
| + signIn()           |
| + signOut()          |
| + getCurrentUser()   |
| + updateProfile()    |
| + resetPassword()    |
+----------------------+
```

#### 1.2 Chat Service Class Diagram

```
+------------------------+       +---------------------+
| ChatService            | 1---* | Message             |
+------------------------+       +---------------------+
| - api: ApiClient       |       | - id: string        |
| - activeChat: Chat     |       | - content: string   |
+------------------------+       | - role: string      |
| + createChat()         |       | - timestamp: Date   |
| + loadChat()           |       | - toolCalls: array  |
| + sendMessage()        |       | - toolResults: array|
| + streamResponse()     |       +---------------------+
| + deleteChat()         |
| + listChats()          |
+------------------------+
```

#### 1.3 Task Service Class Diagram

```
+------------------------+       +---------------------+
| TaskService            | 1---* | Task                |
+------------------------+       +---------------------+
| - api: ApiClient       |       | - id: string        |
| - tasks: Task[]        |       | - title: string     |
+------------------------+       | - description: string|
| + createTask()         |       | - status: string    |
| + updateTask()         |       | - priority: string  |
| + deleteTask()         |       | - dueDate: Date     |
| + listTasks()          |       | - assignedTo: string|
| + getTaskDetails()     |       | - dependencies: Task[]|
| + assignTask()         |       +---------------------+
+------------------------+
```

#### 1.4 File Service Class Diagram

```
+------------------------+       +---------------------+
| FileService            | 1---* | File                |
+------------------------+       +---------------------+
| - api: ApiClient       |       | - id: string        |
| - storage: CloudStorage|       | - name: string      |
+------------------------+       | - path: string      |
| + uploadFile()         |       | - type: string      |
| + downloadFile()       |       | - size: number      |
| + deleteFile()         |       | - createdAt: Date   |
| + listFiles()          |       | - createdBy: string |
| + getFileDetails()     |       +---------------------+
| + generateSignedUrl()  |
+------------------------+
```

#### 1.5 Tool Service Class Diagram

```
+------------------------+       +----------------------+
| ToolService            | 1---* | Tool                 |
+------------------------+       +----------------------+
| - api: ApiClient       |       | - id: string         |
| - availableTools: Tool[]|      | - name: string       |
+------------------------+       | - description: string|
| + listTools()          |       | - parameters: object |
| + executeTool()        |       | - resultSchema: object|
| + getToolStatus()      |       +----------------------+
| + cancelToolExecution()|
+------------------------+
```

### 2. Backend Services

#### 2.1 Agent Service Class Diagram

```
+------------------------+       +--------------------+
| AgentService           | 1---* | AgentMemory        |
+------------------------+       +--------------------+
| - llm: VertexAI        |       | - messages: array  |
| - tools: Tool[]        |       | - context: object  |
| - memory: AgentMemory  |       +--------------------+
+------------------------+
| + processMessage()     |       +--------------------+
| + streamResponse()     |       | PromptTemplate     |
| + callTool()           | 1---* +--------------------+
| + handleFunctionCall() |       | - template: string |
| + generateResponse()   |       | - variables: array |
| + saveContext()        |       +--------------------+
+------------------------+
```

#### 2.2 Backend Task Service Class Diagram

```
+------------------------+       +-----------------------+
| TaskService            | 1---* | TaskRepository        |
+------------------------+       +-----------------------+
| - db: FirestoreClient  |       | - db: FirestoreClient |
| - repo: TaskRepository |       +-----------------------+
+------------------------+       | + create()            |
| + createTask()         |       | + update()            |
| + updateTask()         |       | + delete()            |
| + deleteTask()         |       | + findById()          |
| + listTasks()          |       | + findByProject()     |
| + getTaskDetails()     |       | + findByAssignee()    |
| + assignTask()         |       +-----------------------+
| + decomposeTasks()     |
+------------------------+
```

#### 2.3 Backend File Service Class Diagram

```
+------------------------+       +-----------------------+
| FileService            | 1---* | FileRepository        |
+------------------------+       +-----------------------+
| - storage: CloudStorage|       | - db: FirestoreClient |
| - repo: FileRepository |       +-----------------------+
+------------------------+       | + create()            |
| + uploadFile()         |       | + update()            |
| + downloadFile()       |       | + delete()            |
| + deleteFile()         |       | + findById()          |
| + listFiles()          |       | + findByProject()     |
| + getFileDetails()     |       | + findByName()        |
| + generateSignedUrl()  |       +-----------------------+
+------------------------+
```

#### 2.4 Backend Tool Service Class Diagram

```
+------------------------+       +------------------------+
| ToolService            | 1---* | Tool                   |
+------------------------+       +------------------------+
| - tools: Map<string,Tool>|     | - name: string         |
| - llm: VertexAI        |       | - description: string  |
+------------------------+       | - parameters: object   |
| + registerTool()       |       | - resultSchema: object |
| + executeTool()        |       +------------------------+
| + validateParameters() |       
| + handleToolResult()   |       +------------------------+
| + listTools()          |       | ToolExecution          |
+------------------------+       +------------------------+
                                | - id: string           |
                                | - toolName: string     |
                                | - parameters: object   |
                                | - status: string       |
                                | - result: object       |
                                | - error: string        |
                                +------------------------+
```

#### 2.5 Backend Auth Service Class Diagram

```
+------------------------+       +------------------------+
| AuthService            | 1---* | UserRepository         |
+------------------------+       +------------------------+
| - auth: FirebaseAuth   |       | - db: FirestoreClient  |
| - repo: UserRepository |       +------------------------+
+------------------------+       | + create()             |
| + validateToken()      |       | + update()             |
| + getUserProfile()     |       | + findById()           |
| + updateUserProfile()  |       | + findByEmail()        |
| + checkPermissions()   |       +------------------------+
+------------------------+
```

## Method Specifications

### Frontend AuthService

```typescript
class AuthService {
  private auth: FirebaseAuth;
  
  constructor() {
    this.auth = getAuth();
  }
  
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      // Handle authentication errors
      throw error;
    }
  }
  
  async signOut(): Promise<void> {
    try {
      await this.auth.signOut();
    } catch (error) {
      throw error;
    }
  }
  
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
  
  async updateProfile(profile: { displayName?: string, photoURL?: string }): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error("No authenticated user");
    
    try {
      await updateProfile(user, profile);
    } catch (error) {
      throw error;
    }
  }
  
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw error;
    }
  }
}
```

### Backend FileService

```python
class FileService:
    def __init__(self, storage_client, file_repository):
        self.storage = storage_client
        self.repo = file_repository
    
    async def upload_file(self, project_id: str, file_obj, filename: str, user_id: str):
        """Upload a file to Cloud Storage and store metadata in Firestore"""
        try:
            # Generate storage path
            path = f"{user_id}/{project_id}/{filename}"
            
            # Upload to Cloud Storage
            blob = self.storage.bucket.blob(path)
            blob.upload_from_file(file_obj)
            
            # Store metadata in Firestore
            file_data = {
                "projectId": project_id,
                "name": filename,
                "path": path,
                "type": self._determine_file_type(filename),
                "mimeType": blob.content_type,
                "size": blob.size,
                "createdAt": datetime.now(),
                "updatedAt": datetime.now(),
                "createdBy": user_id
            }
            
            file_id = await self.repo.create(file_data)
            return {"id": file_id, **file_data}
        
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to upload file")
    
    async def download_file(self, file_id: str, user_id: str):
        """Generate a signed URL for downloading a file"""
        file = await self.repo.find_by_id(file_id)
        
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Check user has access to the project
        if not await self._check_project_access(file["projectId"], user_id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Generate signed URL
        blob = self.storage.bucket.blob(file["path"])
        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=15),
            method="GET"
        )
        
        return {"url": url}
    
    async def delete_file(self, file_id: str, user_id: str):
        """Delete a file from storage and remove metadata from database"""
        file = await self.repo.find_by_id(file_id)
        
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Check user has access to the project
        if not await self._check_project_access(file["projectId"], user_id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Delete from Cloud Storage
        blob = self.storage.bucket.blob(file["path"])
        blob.delete()
        
        # Delete metadata from Firestore
        await self.repo.delete(file_id)
        
        return {"status": "success", "message": "File deleted successfully"}
    
    async def list_files(self, project_id: str, user_id: str):
        """List all files in a project"""
        # Check user has access to the project
        if not await self._check_project_access(project_id, user_id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        files = await self.repo.find_by_project(project_id)
        return {"files": files}
    
    async def _check_project_access(self, project_id: str, user_id: str) -> bool:
        """Check if user has access to the project"""
        # Implementation depends on project permissions system
        # This is a simplified version
        project = await self.project_repo.find_by_id(project_id)
        return project and (project["ownerId"] == user_id or user_id in [c["userId"] for c in project.get("collaborators", [])])
    
    def _determine_file_type(self, filename: str) -> str:
        """Determine the type of file based on extension"""
        extension = filename.split(".")[-1].lower()
        
        if extension in ["doc", "docx", "pdf", "txt", "rtf"]:
            return "document"
        elif extension in ["jpg", "jpeg", "png", "gif", "svg"]:
            return "image"
        elif extension in ["xls", "xlsx", "csv"]:
            return "spreadsheet"
        elif extension in ["ppt", "pptx"]:
            return "presentation"
        else:
            return "other"
```

## Test Plans

### 1. Frontend Authentication Service Test Plan

| Test ID | Test Name | Description | Prerequisites | Test Steps | Expected Results |
|---------|-----------|-------------|---------------|------------|------------------|
| AUTH-01 | User Sign In Success | Verify user can sign in with valid credentials | User exists in Firebase Auth | 1. Call signIn() with valid email/password<br>2. Verify return value | User is signed in successfully<br>UserCredential object is returned |
| AUTH-02 | User Sign In Invalid | Verify error handling for invalid credentials | N/A | 1. Call signIn() with invalid email/password<br>2. Catch error | Error is thrown with appropriate message |
| AUTH-03 | User Sign Out | Verify user can sign out | User is signed in | 1. Call signOut()<br>2. Check auth.currentUser | Method succeeds<br>currentUser is null after sign out |
| AUTH-04 | Get Current User | Verify getCurrentUser returns correct user | User is signed in | 1. Call getCurrentUser()<br>2. Verify returned user | Returns the currently authenticated user |
| AUTH-05 | Update Profile | Verify user profile can be updated | User is signed in | 1. Call updateProfile() with new name<br>2. Get updated user | Profile is updated with new details |
| AUTH-06 | Password Reset | Verify password reset email is sent | User exists in Firebase | 1. Call resetPassword()<br>2. Check Firebase logs | Password reset email is sent to user |

### 2. Backend File Service Test Plan

| Test ID | Test Name | Description | Prerequisites | Test Steps | Expected Results |
|---------|-----------|-------------|---------------|------------|------------------|
| FILE-01 | Upload File Success | Verify file upload functionality | User authenticated<br>Project exists | 1. Call upload_file() with valid parameters<br>2. Check storage and database | File is stored in Cloud Storage<br>Metadata saved in Firestore<br>Correct response returned |
| FILE-02 | Upload File Failure | Verify error handling during upload | N/A | 1. Call upload_file() with invalid parameters<br>2. Catch error | HTTP 500 error is returned<br>Error is logged |
| FILE-03 | Download File | Verify file download URL generation | File exists<br>User has access | 1. Call download_file()<br>2. Verify URL | Signed URL is generated<br>URL is valid and allows download |
| FILE-04 | Download Access Control | Verify file access control | File exists<br>User lacks permission | 1. Call download_file() as unauthorized user<br>2. Catch error | HTTP 403 error is returned |
| FILE-05 | Delete File | Verify file deletion | File exists<br>User has access | 1. Call delete_file()<br>2. Check storage and database | File is removed from storage<br>Metadata removed from database |
| FILE-06 | List Files | Verify listing project files | Project exists<br>User has access | 1. Call list_files()<br>2. Verify response | List of files is returned<br>Only files for specified project |
| FILE-07 | File Not Found | Verify error handling for missing files | N/A | 1. Call download_file() or delete_file() with invalid ID<br>2. Catch error | HTTP 404 error is returned |

### 3. Agent Service Test Plan

| Test ID | Test Name | Description | Prerequisites | Test Steps | Expected Results |
|---------|-----------|-------------|---------------|------------|------------------|
| AGENT-01 | Process Message | Verify message processing | Agent initialized | 1. Call processMessage() with user input<br>2. Verify response | Message is processed<br>Appropriate response generated |
| AGENT-02 | Tool Calling | Verify function calling capability | Agent initialized with tools | 1. Send message requiring tool use<br>2. Verify tool calls | Tool is called with correct parameters<br>Tool results incorporated into response |
| AGENT-03 | Stream Response | Verify streaming response | Agent initialized | 1. Call streamResponse()<br>2. Verify streaming behavior | Response is streamed in chunks<br>Complete response matches expected output |
| AGENT-04 | Context Management | Verify conversation context | Previous messages exist | 1. Send follow-up message<br>2. Verify context retention | Agent maintains conversation context<br>Response acknowledges previous messages |
| AGENT-05 | Error Handling | Verify LLM error handling | N/A | 1. Simulate LLM API failure<br>2. Catch error | Error is handled gracefully<br>User-friendly message returned |

### 4. Task Service Test Plan

| Test ID | Test Name | Description | Prerequisites | Test Steps | Expected Results |
|---------|-----------|-------------|---------------|------------|------------------|
| TASK-01 | Create Task | Verify task creation | Project exists<br>User authenticated | 1. Call createTask() with task details<br>2. Verify database | Task is created in database<br>Correct response returned |
| TASK-02 | Update Task | Verify task update | Task exists | 1. Call updateTask() with new details<br>2. Verify database | Task is updated in database<br>Response reflects changes |
| TASK-03 | Delete Task | Verify task deletion | Task exists | 1. Call deleteTask()<br>2. Verify database | Task is removed from database |
| TASK-04 | List Tasks | Verify task listing | Project has tasks | 1. Call listTasks()<br>2. Verify response | List of tasks is returned<br>Tasks filtered by project |
| TASK-05 | Task Dependencies | Verify task dependencies | Multiple tasks exist | 1. Create tasks with dependencies<br>2. Verify relationship handling | Dependencies are correctly established<br>Dependency validation works |
| TASK-06 | Task Decomposition | Verify AI task breakdown | Project exists | 1. Call decomposeTasks() with high-level task<br>2. Verify result | Task is broken down into subtasks<br>Dependencies established |

## Implementation Plan

The implementation will proceed in phases, with each phase focusing on specific services and functionality:

1. **Phase 1: Core Infrastructure**
   - Authentication Service
   - File Service
   - Basic Database Models
   - Frontend Shell

2. **Phase 2: Communication Layer**
   - Chat Service
   - Agent Service Integration
   - Basic LLM Integration

3. **Phase 3: Task Management**
   - Task Service
   - Task Decomposition

4. **Phase 4: Tools Integration**
   - Tool Service
   - Web Search Integration
   - Document Generation

5. **Phase 5: Advanced Features**
   - Image Generation
   - Timeline Creation
   - Document Analysis

Each class will be implemented following the specifications provided in this document, with comprehensive tests based on the test plans to ensure quality and reliability. 