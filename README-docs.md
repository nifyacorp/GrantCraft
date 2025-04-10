# GrantCraft Documentation (`docs/`)

## 1. Overview & Purpose

This directory serves as the central repository for all project-related documentation, including design decisions, architectural diagrams, API specifications, user guides, and planning documents.

**Key Goals:**

*   **Knowledge Sharing:** Provide a single source of truth for understanding the GrantCraft system's design, features, and implementation details.
*   **Onboarding:** Help new team members quickly get up to speed on the project.
*   **Decision Record:** Document key architectural choices and the reasoning behind them.
*   **Reference:** Offer detailed specifications for APIs and system components.
*   **Planning:** Contain project plans, feature definitions, and potentially user stories.

## 2. Proposed Subdirectories

*   **`architecture/`:** Contains high-level system architecture diagrams (like those in `STRUCTURE.MD` and `ProjectStructure.md`), component breakdowns, service interaction diagrams, and potentially ADRs (Architecture Decision Records).
*   **`api/`:** Holds detailed API specifications. This could include:
    *   OpenAPI (Swagger) specifications for the backend REST APIs.
    *   Definitions of data schemas/models used in API requests/responses.
    *   Documentation on authentication/authorization mechanisms.
*   **`design/`:** Contains UI/UX design documents, wireframes, mockups, user flow diagrams, and potentially design system guidelines.
*   **(Potentially others):**
    *   `guides/`: User manuals, getting started guides (`GETTING-STARTED.md` could live here), deployment guides.
    *   `planning/`: Project plans (`execution-plan.md`), feature definitions (`GrantCraft-Features.md`, `AI-TOOLS.md`), meeting notes, feedback (`PLAN_FEEDBACK.md`).
    *   `models/`: Detailed data model definitions (`CoreModels.md`).

## 3. Key Documents (Based on Provided Files)

This directory should house or reference the documents provided:

*   `STRUCTURE.MD` (or moved to `architecture/`) - Overall microservice structure.
*   `ProjectStructure.md` (or moved to `architecture/`) - GCP architecture overview.
*   `AI-TOOLS.MD` (likely in `planning/` or `architecture/`) - Details on AI tool capabilities.
*   `CoreModels.md` (likely in `models/` or `architecture/`) - Core system concepts and data models.
*   `execution-plan.md` (likely in `planning/`) - Implementation plan.
*   `GCPRebuildPlan.md` (likely in `planning/` or `architecture/`) - Rebuild plan overview.
*   `GETTING-STARTED.md` (likely in `guides/`) - Setup instructions.
*   `GrantCraft-Features.md` (likely in `planning/`) - Detailed feature list.
*   `PLAN_FEEDBACK.md` (likely in `planning/`) - Feedback on the plan.

## 4. Key Requirements & Considerations

*   **Format:** Use a consistent format, primarily Markdown (`.md`) for easy version control and readability.
*   **Organization:** Maintain a clear and logical folder structure.
*   **Up-to-Date:** Documentation should be kept reasonably up-to-date with the codebase and system design. Stale documentation can be misleading.
*   **Accessibility:** Ensure documentation is easily discoverable and accessible to all team members.
*   **Diagrams:** Use tools like Mermaid (as seen in provided docs), PlantUML, or diagramming software (exporting images) to create clear visualizations. Store source files (e.g., `.mermaid`, `.drawio`) alongside exported images where possible.
*   **Review:** Important documentation (especially architectural decisions and API specs) should be reviewed by the team.

## 5. Interactions with Other Top-Level Directories

*   **`services/`, `frontend/`, `shared/`, `infrastructure/`:** Documentation in `docs/` describes the design, purpose, and usage of the code and configurations within these directories. Code comments should reference relevant documentation where appropriate. 