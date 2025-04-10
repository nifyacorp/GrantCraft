# GrantCraft Backend Microservices (`services/`)

## 1. Overview & Purpose

This directory contains the backend logic for the GrantCraft application, decomposed into independent microservices. This microservice architecture is designed to:

*   **Modularize Functionality:** Each service handles a distinct business domain (users, projects, chat, files, tasks, AI agent).
*   **Enable Independent Scaling:** Services can be scaled individually based on load.
*   **Facilitate Independent Development & Deployment:** Teams can work on different services concurrently.
*   **Improve Resilience:** Failure in one service is less likely to impact others directly (depending on interaction patterns).

The services collectively provide the API layer consumed by the `Frontend` and orchestrate interactions with underlying cloud infrastructure like Firestore, Cloud Storage, and Vertex AI.

## 2. Architectural Pattern

*   **Technology:** Primarily FastAPI (Python) is proposed for consistency, running in containerized environments (e.g., Cloud Run).
*   **Communication:**
    *   **External:** Services are exposed externally via the `API Gateway`, which handles routing, authentication, and potentially aggregation.
    *   **Internal:** Services may communicate internally via synchronous APIs (REST/gRPC) or asynchronous events (e.g., Pub/Sub) depending on the interaction need (e.g., `AgentService` calling `TaskService`).
*   **Data Management:** Each service typically owns its primary data schemas, interacting primarily with Firestore collections relevant to its domain. Shared data models/types might reside in the `/shared` directory.
*   **Deployment:** Each service is intended to be deployed as a separate Cloud Run instance, defined by its own `Dockerfile`.

## 3. Contained Services (High-Level)

*   **`api-gateway/`:** Entry point, routing, authentication validation.
*   **`user-service/`:** User profile management.
*   **`project-service/`:** Project lifecycle, collaborators, metadata.
*   **`chat-service/`:** Chat session and message persistence.
*   **`file-service/`:** File metadata management, Cloud Storage interaction.
*   **`task-service/`:** Task/subtask management, status tracking.
*   **`agent-service/`:** Core AI logic, Vertex AI interaction, tool orchestration.

*(Refer to `README-services-<service_name>.md` for details on each specific service).*

## 4. Key Requirements & Considerations

*   **Authentication:** Services (or the Gateway) must validate Firebase Auth tokens on incoming requests.
*   **Authorization:** Access control logic needs to be implemented, potentially based on project roles defined in `ProjectService`.
*   **Configuration:** Services will require configuration for database connections, API keys (Vertex AI), Cloud Storage buckets, etc., ideally managed via Secret Manager.
*   **Logging & Monitoring:** Structured logging and monitoring are essential for observability across distributed services.
*   **Error Handling:** Consistent error handling and reporting patterns across services.
*   **Testing:** Each service requires its own suite of unit and integration tests.
*   **Data Consistency:** Strategies may be needed to handle data consistency across services if strong coupling exists (e.g., eventual consistency via events, or synchronous calls where necessary).
*   **API Design:** Internal and external APIs should be well-defined (e.g., using OpenAPI specifications).

## 5. Interactions with Other Top-Level Directories

*   **`frontend/`:** Consumes the APIs exposed by the services (via the `API Gateway`).
*   **`shared/`:** May consume shared libraries (`libs/`) or type definitions (`types/`) for consistency (e.g., Pydantic models).
*   **`infrastructure/`:** Defined by Infrastructure as Code (IaC) configurations for deployment (Cloud Run services, Firestore rules, IAM roles, etc.).
*   **`docs/`:** Contains detailed design documents, API specifications, and architecture diagrams relevant to the services. 