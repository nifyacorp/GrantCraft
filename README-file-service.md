# GrantCraft File Service - README

**Parent Folder:** `services/`
**Service Location:** `services/file-service/`

## 1. Purpose

The `FileService` is a backend microservice responsible for managing all aspects of file storage and metadata within the GrantCraft system. It acts as the primary interface for interacting with user-uploaded documents, AI-generated files, and other project-related assets. It abstracts the underlying storage mechanisms (Cloud Storage for blobs, Firestore for metadata) and provides a consistent API for file operations.

## 2. Core Responsibilities & Features

*   **Metadata Management:** Create, read, update, and delete file metadata records stored in the `files` collection within Cloud Firestore. Metadata includes file name, path, type, size, timestamps, owner, project association, and potentially custom metadata.
*   **Blob Storage Interaction:** Manage the persistence of file content (blobs) in Google Cloud Storage within the designated bucket (`grant-craft-files`). This includes handling uploads and providing mechanisms for downloads.
*   **Access Control:** Ensure secure access to files based on user identity and project association. Generate time-limited, secure signed URLs for client-side download/access to blobs in Cloud Storage, preventing direct public access.
*   **API Provision:** Expose RESTful API endpoints for file operations, consumed primarily by the `Frontend` and potentially internal services like `AgentService`.
*   **File Organization:** Maintain a structured organization of files within Cloud Storage, typically segregated by user and project (e.g., `users/{userId}/projects/{projectId}/`).
*   **File Type Identification:** Determine and store the type of file (e.g., document, image, spreadsheet) based on filename or MIME type.
*   **(Potential) Versioning:** Support tracking and retrieval of different file versions (as indicated in feature lists, though implementation details may vary).
*   **(Potential) Format Conversion:** Offer capabilities to convert files between formats (as indicated in feature lists).

## 3. Data Management

*   **Primary Data Store (Metadata):** Google Cloud Firestore.
    *   **Collection:** `files`
    *   **Schema:** See `ProjectStructure.md` or `execution-plan.md` for the `File` model definition (includes `id`, `projectId`, `name`, `path`, `type`, `mimeType`, `size`, `createdAt`, `updatedAt`, `createdBy`, `metadata`).
*   **Secondary Data Store (Blobs):** Google Cloud Storage.
    *   **Bucket:** `grant-craft-files` (or as configured)
    *   **Structure:** Files organized typically under `users/{userId}/projects/{projectId}/`.

## 4. API Endpoints (Conceptual)

The service exposes endpoints under a base path (e.g., `/api`), likely routed via the `API Gateway`. Expected endpoints include:

*   `GET /api/projects/{projectId}/files`: List files associated with a specific project.
*   `POST /api/projects/{projectId}/files`: Upload a new file to a project. Handles both metadata creation in Firestore and blob upload to Cloud Storage.
*   `GET /api/files/{fileId}`: Retrieve metadata for a specific file.
*   `GET /api/files/{fileId}/content`: Obtain a secure, time-limited signed URL for downloading the file blob.
*   `PUT /api/files/{fileId}`: Update file metadata (e.g., rename).
*   `DELETE /api/files/{fileId}`: Delete a file (both metadata and blob).

## 5. Interactions with Other Services

*   **`Frontend`:** The primary consumer of the `FileService` API for all user-facing file operations (browsing, uploading, downloading, deleting, renaming).
*   **`API Gateway`:** Routes incoming HTTP requests from the `Frontend` to the appropriate `FileService` endpoint. Handles authentication verification before forwarding requests.
*   **`AgentService` / AI Tools (`FileManagementTool`, `DocumentGenerationTool`):** Interacts with `FileService` via internal APIs or direct SDK calls to:
    *   Create new files resulting from generation tasks (e.g., generated proposal sections, images).
    *   Read existing files for context or analysis.
    *   List files within a project for situational awareness.
*   **`ProjectService` (Implied):** `FileService` operations require validation of user permissions against project ownership or collaboration status, potentially involving lookups or context passed from `ProjectService` via the calling service or API Gateway.
*   **`Firebase Authentication`:** Implicit interaction via authenticated user context provided in requests, used for authorization checks and associating files (`createdBy`, storage path).
*   **`Cloud Firestore`:** Direct interaction via SDK for CRUD operations on the `files` collection.
*   **`Cloud Storage`:** Direct interaction via SDK for blob upload, download (via signed URLs), and deletion.

## 6. Security Considerations

*   **Authentication:** All API endpoints require valid authentication tokens (e.g., Firebase JWT) passed from the `API Gateway`.
*   **Authorization:** File operations are authorized based on user ownership or collaboration status within the associated project. Permissions are checked before executing operations.
*   **Secure Access:** Direct access to Cloud Storage buckets is restricted. Secure, short-lived signed URLs are generated by the `FileService` backend for client-side downloads/access, ensuring temporary, controlled access to file blobs.
*   **Input Validation:** API endpoints validate inputs (e.g., file IDs, project IDs) to prevent unauthorized access or errors.

## 7. Non-Functional Requirements

*   **Scalability:** Must handle potentially large numbers of files and concurrent uploads/downloads. Leverages scalable GCP services (Cloud Run, Firestore, Cloud Storage).
*   **Reliability:** Ensure high availability for file access and persistence. Data durability is primarily handled by Cloud Storage and Firestore.
*   **Performance:** Provide low latency for metadata operations and efficient generation of signed URLs. Upload/download performance depends on Cloud Storage and network conditions. 