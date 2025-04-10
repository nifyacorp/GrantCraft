# GranCraft Implemented Processes

This document outlines the key processes implemented in the GranCraft system using Mermaid diagrams.

## 1. API Request Flow

This diagram shows the general flow of an authenticated API request from the frontend to a backend service via the API Gateway.

```mermaid
sequenceDiagram
    participant Frontend
    participant API Gateway
    participant Firebase Auth
    participant Target Service (e.g., Chat Service, File Service)

    Frontend->>+API Gateway: Request (e.g., POST /api/chats/{chat_id}/messages) with Auth Header
    API Gateway->>+Firebase Auth: Verify ID Token
    Firebase Auth-->>-API Gateway: User Info / Error
    alt Authentication Successful
        API Gateway->>API Gateway: Determine Target Service based on path (/chats -> chat-service)
        API Gateway->>+Target Service: Forward Request with User Info Headers (X-User-ID, X-User-Email)
        Target Service->>Target Service: Process Request (e.g., create message in DB)
        Target Service-->>-API Gateway: Service Response
        API Gateway-->>-Frontend: Final Response
    else Authentication Failed
        API Gateway-->>-Frontend: 401 Unauthorized Error
    end
```

## 2. Chat Management Flow

This diagram illustrates the interactions involved in managing chat sessions and messages through the Chat Service.

```mermaid
sequenceDiagram
    participant API Gateway
    participant Chat Service
    participant Firestore DB

    API Gateway->>+Chat Service: POST /projects/{proj_id}/chats (CreateChatRequest)
    Chat Service->>+Firestore DB: Create Chat Document
    Firestore DB-->>-Chat Service: Created Chat Data
    Chat Service-->>-API Gateway: New Chat Object

    API Gateway->>+Chat Service: GET /projects/{proj_id}/chats
    Chat Service->>+Firestore DB: Query Chats Collection (projectId == proj_id)
    Firestore DB-->>-Chat Service: List of Chat Data
    Chat Service-->>-API Gateway: List of Chat Objects

    API Gateway->>+Chat Service: POST /chats/{chat_id}/messages (CreateMessageRequest)
    Chat Service->>+Firestore DB: Get Chat Document (to verify existence)
    Firestore DB-->>-Chat Service: Chat Data / Not Found
    opt Chat Found
        Chat Service->>+Firestore DB: Create Message Sub-Document
        Firestore DB-->>-Chat Service: Created Message Data
        Chat Service-->>-API Gateway: New Message Object
    else Chat Not Found
        Chat Service-->>-API Gateway: 404 Not Found Error
    end

    API Gateway->>+Chat Service: GET /chats/{chat_id}/messages
    Chat Service->>+Firestore DB: Query Messages Sub-Collection (chatId == chat_id)
    Firestore DB-->>-Chat Service: List of Message Data
    Chat Service-->>-API Gateway: List of Message Objects
```

## 3. File Management Flow

This diagram shows the process for uploading and downloading files using the File Service.

```mermaid
sequenceDiagram
    participant Frontend
    participant API Gateway
    participant File Service
    participant Firestore DB
    participant Cloud Storage

    %% File Upload Process
    Frontend->>+API Gateway: POST /api/files/projects/{proj_id} (FileCreate metadata)
    API Gateway->>+File Service: Forward Request
    File Service->>+Cloud Storage: Generate Signed Upload URL (for gs://bucket/user_id/proj_id/file_name)
    Cloud Storage-->>-File Service: Signed Upload URL & Blob Path
    File Service->>+Firestore DB: Create File Metadata Document (with blob path, status=pending)
    Firestore DB-->>-File Service: Created File Metadata
    File Service-->>-API Gateway: FileUploadResponse (Metadata + Upload URL)
    API Gateway-->>-Frontend: FileUploadResponse
    Frontend->>+Cloud Storage: PUT Request to Signed Upload URL with File Content
    Cloud Storage-->>-Frontend: Upload Success/Failure
    %% Note: A separate mechanism (e.g., Cloud Function trigger on Storage) would ideally update the Firestore status to 'uploaded'. This is not shown in the current File Service code.

    %% File Download Process
    Frontend->>+API Gateway: GET /api/files/{file_id}/content
    API Gateway->>+File Service: Forward Request
    File Service->>+Firestore DB: Get File Metadata Document (to get path)
    Firestore DB-->>-File Service: File Metadata (including path)
    opt File Metadata Found
        File Service->>+Cloud Storage: Generate Signed Download URL (for file.path)
        Cloud Storage-->>-File Service: Signed Download URL
        File Service-->>-API Gateway: FileDownloadResponse (Metadata + Download URL)
    else File Metadata Not Found
        File Service-->>-API Gateway: 404 Not Found Error
    end
    API Gateway-->>-Frontend: FileDownloadResponse / Error
    Frontend->>+Cloud Storage: GET Request to Signed Download URL
    Cloud Storage-->>-Frontend: File Content
``` 