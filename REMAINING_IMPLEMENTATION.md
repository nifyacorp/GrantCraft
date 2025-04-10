# GrantCraft - Remaining Implementation Tasks

This document lists features and components identified in the project documentation that likely still require implementation based on the current state inferred from the provided READMEs and planning files.

## Core Infrastructure & Setup

*   **CI/CD Pipelines:** While mentioned in plans (`execution-plan.md`), the actual implementation of CI/CD pipelines using Cloud Build (or other tools) for automated testing, building, and deployment of frontend and backend services is likely pending.
*   **Monitoring & Alerting:** Detailed setup of Cloud Monitoring dashboards, custom metrics, logging configurations beyond defaults, and specific alert policies (`GETTING-STARTED.md`, `execution-plan.md`) needs implementation.
*   **Infrastructure as Code (IaC):** While the `infrastructure/` directory is proposed (`README-infrastructure.md`, `STRUCTURE.MD`), the actual Terraform/Pulumi/Deployment Manager code to fully define all GCP and Firebase resources is likely incomplete or needs refinement.
*   **Secrets Management Integration:** Backend services need full integration to securely fetch and use secrets from Secret Manager at runtime (`GETTING-STARTED.md`).
*   **Cost Management Setup:** Implementing specific cost optimization strategies and detailed billing alerts/budgets (`execution-plan.md`).

## Frontend (`frontend/`)

*   **Component Implementation:** Most specific UI components outlined (`execution-plan.md`, `README-frontend.md`) likely need full implementation:
    *   Detailed Chat Interface components (message rendering options, real-time updates).
    *   Task Management UI (Task board, drag-and-drop, filtering, details view).
    *   File Browser (previews, advanced operations).
    *   Specific Tool Interaction UI (`ToolSelector`).
    *   Visualization components (Gantt charts, budget tables, image displays).
    *   Dashboard and Analytics components.
    *   In-browser Document Editor.
*   **State Management:** Implementation of the chosen state management solution (React Context, Zustand, etc.).
*   **API Integration:** Connecting all UI components to the corresponding backend API endpoints.
*   **Testing:** Comprehensive unit and potentially end-to-end tests.
*   **UI/UX Refinements:** Polishing styles, implementing loading states, error handling, and improving overall user experience beyond basic structure (`execution-plan.md Phase 7`).

## Backend Services (`services/`)

*(While READMEs define the intent, the actual application code within `services/*/app/` is likely missing or minimal for most services).*

*   **`api-gateway/`:** Implementation of routing logic, request validation, potential response aggregation, rate limiting, and CORS handling.
*   **`user-service/`:** Implementation of user profile CRUD operations, settings management.
*   **`project-service/`:** Implementation of project CRUD, collaborator management, permission logic.
*   **`chat-service/`:** Implementation of chat session/message CRUD, potentially streaming capabilities.
*   **`file-service/`:** Implementation of file metadata CRUD, Cloud Storage interaction (upload/signed URLs), potentially versioning/conversion features.
*   **`task-service/`:** Implementation of task CRUD, subtask/dependency management, status tracking.
*   **`agent-service/`:**
    *   Core AI logic implementation (conversation management, context handling).
    *   Prompt engineering implementation and integration with the prompt management system.
    *   Full Vertex AI integration (API calls, response parsing, error handling).
    *   Tool Orchestration logic (`ToolRouter` or similar) beyond the schema generation shown in `AI-TOOLS.md`.
    *   Internal API communication implementation (calling other services like `FileService`, `TaskService`).
*   **Testing:** Unit and integration tests for each service.
*   **Error Handling:** Implementing the standardized error handling strategy across all services (`execution-plan.md Phase 10`).

## AI Tools (`agent-service/tools/`)

*The class structures and basic method signatures are defined in `AI-TOOLS.md`, but the core logic using Vertex AI for generation/analysis is likely pending.*

*   **Document Generation Tool:** Full implementation of prompt creation and Vertex AI calls for generating various sections, including formatting and citation logic.
*   **Research Tool:** Implementation of Vertex AI calls for research, summarization, trend analysis, funding source analysis, and structured output generation.
*   **File Management Tool:** While the `FileService` handles storage, this *AI tool* needs logic to *use* the `FileService` based on agent instructions (e.g., generating file templates, converting formats - which also requires `FileService` support).
*   **Timeline Generation Tool:** Implementation of Vertex AI calls to parse descriptions and generate timeline/Gantt data structures.
*   **Budget Generation Tool:** Implementation of Vertex AI calls to generate itemized budgets and justifications based on descriptions and parameters.
*   **Image Generation Tool:** Implementation of logic to generate *prompts* for image models and potentially integrate with an image generation service (Vertex AI Imagen or other). Implementation of chart *data* generation using Vertex AI.

## Shared Code (`shared/`)

*   **Implementation:** Populating `shared/libs` with actual utility functions and `shared/types` with complete Pydantic/TypeScript definitions.
*   **Integration Mechanism:** Implementing the chosen strategy (monorepo tooling, private packages) for consuming shared code in frontend and backend services.

## Advanced/Extended Features (`execution-plan.md`)

*These are planned for later phases and definitely not yet implemented:*
*   **Collaboration Features:** User invitations, permissions, real-time editing, commenting, activity feeds.
*   **Advanced Document Management:** Template library, custom templates, version control, comparison, annotation.
*   **AI Customization:** Custom prompts, institutional boilerplate, style preferences, saved elements.
*   **External Integrations:** Third-party services (reference managers, calendars), external tool APIs.
*   **Literature Review Tool:** (Phase 6 feature) Academic paper search, summarization, citation extraction, bibliography generation.

---
*This list is based on comparing the planning documents and READMEs. A code-level review would be needed for a definitive status.* 