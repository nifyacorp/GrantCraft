# GrantCraft Chat Service - README

## 1. Overview

The Chat Service (`ChatService` or `CS`) is a core backend microservice within the GrantCraft system. Its primary function is to manage all aspects of chat interactions between users and the AI assistant within the context of specific grant projects. It serves as the persistent store for conversational data, enabling context retention and historical review.

## 2. Responsibilities

-   **Chat Session Management:** Handles the creation, retrieval, and potentially metadata updates for distinct chat sessions associated with specific projects.
-   **Message Persistence:** Responsible for storing and retrieving individual messages within each chat session. This includes user messages, AI assistant responses, and system messages.
-   **Data Integrity:** Ensures chat data (sessions and messages) is correctly associated with the corresponding project and user context.
-   **Context Provision:** Provides conversation history and context to other services, notably the `AgentService`, which relies on this data for maintaining conversational state and making informed AI responses.
-   **Real-time Support (Potential):** May offer streaming capabilities for real-time chat message updates to the frontend, although the primary responsibility is persistence.

## 3. Technology Stack

-   **Framework:** FastAPI (or a similar Python framework).
-   **Database:** Google Cloud Firestore for persistent storage of chat and message data.

## 4. Data Models (Firestore)

The service interacts primarily with two Firestore collections:

### 4.1. `chats` Collection

-   **Purpose:** Stores metadata for each chat session.
-   **Fields:**
    -   `id` (string): Auto-generated unique chat identifier.
    -   `projectId` (string): Identifier of the project this chat belongs to. Indexed for querying chats per project.
    -   `title` (string): User-defined or automatically generated title for the chat session.
    -   `createdAt` (timestamp): Timestamp of chat creation.
    -   `updatedAt` (timestamp): Timestamp of the last message or update to the chat.
-   **Indexes:** `projectId`

### 4.2. `messages` Collection

-   **Purpose:** Stores individual messages within a chat session.
-   **Fields:**
    -   `id` (string): Auto-generated unique message identifier.
    -   `chatId` (string): Identifier of the parent chat session this message belongs to. Indexed for querying messages per chat.
    -   `content` (string): The textual content of the message.
    -   `role` (string): Indicates the sender ('user', 'assistant', 'system').
    -   `timestamp` (timestamp): Timestamp of message creation.
    -   `toolCalls` (array): Optional. Records of AI tool calls initiated from this message context.
        -   `id` (string): Unique ID for the tool call.
        -   `toolName` (string): Name of the tool invoked.
        -   `parameters` (map): Parameters passed to the tool.
        -   `status` (string): Status of the tool call ('pending', 'running', 'completed', 'failed').
    -   `toolResults` (array): Optional. Results corresponding to tool calls.
        -   `toolCallId` (string): Reference ID linking back to the `toolCalls` entry.
        -   `result` (map): The data returned by the tool execution.
        -   `error` (string): Error message if the tool execution failed.
-   **Indexes:** `chatId`

## 5. Interactions & Dependencies

-   **API Gateway:** Receives incoming HTTP requests routed from the API Gateway based on the path prefix `/chats/**`.
-   **Firestore:** Performs Create, Read, Update, Delete (CRUD) operations on the `chats` and `messages` collections in Firestore.
-   **AgentService:** Provides conversation history (messages) to the `AgentService` upon request via an internal API call. This is crucial for the AI agent to maintain context.
-   **Frontend:** Indirectly supports the Frontend chat interface by persisting messages sent by the user and providing the history of the conversation for display. Real-time updates might be facilitated through this service or directly via Firestore listeners managed by the Frontend/Backend.

## 6. API Endpoints (Expected Interface)

The service is expected to expose endpoints conforming to the following patterns, likely served under the `/api` prefix managed by the API Gateway:

-   `GET /api/projects/{projectId}/chats`: List all chat sessions associated with a given project.
-   `POST /api/projects/{projectId}/chats`: Create a new chat session within a project.
-   `GET /api/chats/{chatId}/messages`: Retrieve the message history for a specific chat session.
-   `POST /api/chats/{chatId}/messages`: Persist a new message (from user or assistant) to a specific chat session.

*Note: Endpoints related to `/tools` listed in some documents (`GET /api/chats/{chatId}/tools`, `POST /api/chats/{chatId}/tools/{toolName}`) likely belong to the `AgentService` or `ToolService` for managing tool execution context, rather than the `ChatService` itself, whose primary role is persistence.*

## 7. Security Considerations

-   Access control is primarily enforced via Firestore Security Rules.
-   Rules ensure that users can only read/write chat and message documents associated with projects they are owners of or collaborators on (`hasProjectAccess` check).
-   Authentication context (`request.auth`) is used within security rules to verify user identity.

## 8. Key Features Supported

-   Persistence of multi-turn chat conversations.
-   Association of chats with specific projects.
-   Retrieval of conversation history for context management by the AI agent.
-   Storage of message metadata, including sender role and timestamps.
-   Storage of related AI tool call information (`toolCalls`, `toolResults`) within the message context.
-   Foundation for real-time chat experiences (though real-time delivery might involve other components). 