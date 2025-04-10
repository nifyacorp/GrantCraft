# GrantCraft Shared Code (`shared/`)

## 1. Overview & Purpose

This directory is intended to hold code, type definitions, and potentially utility libraries that need to be shared across multiple microservices (in `services/`) or between the frontend (`frontend/`) and backend.

The primary goals are:

*   **Promote Consistency:** Ensure that different parts of the system use the same data structures and potentially common utility functions.
*   **Reduce Code Duplication:** Avoid redefining the same data models or utility functions in multiple places.
*   **Improve Maintainability:** Changes to shared entities need only be made in one location.

## 2. Proposed Subdirectories

*   **`libs/`:** Intended for shared utility functions or libraries. Examples might include:
    *   Common data validation logic.
    *   Shared constants or configuration schemas.
    *   Potentially, custom error classes used across services.
    *   *(Use with caution to avoid tight coupling between services)*
*   **`types/`:** Intended for shared data structure definitions. Examples include:
    *   **Pydantic Models (Python):** For backend services to define API request/response bodies and database models consistently.
    *   **TypeScript Types/Interfaces:** For the frontend and potentially backend services (if using TypeScript) to define data structures corresponding to API payloads or shared concepts.

## 3. Key Requirements & Considerations

*   **Dependency Management:** How will services and the frontend consume code from `shared/`? Potential strategies:
    *   **Monorepo Tooling:** Tools like Nx, Lerna, or Turborepo can manage dependencies within the monorepo, building and linking shared packages automatically.
    *   **Private Package Registry:** Publish shared code as versioned packages to a private registry (e.g., Artifact Registry, npm private packages) and have services/frontend declare them as dependencies.
    *   **Direct Path Imports (Simpler, but couples more tightly):** Use relative path imports if the monorepo structure allows and build processes handle it.
    *   *The chosen strategy impacts setup and CI/CD.* The current structure suggests monorepo tooling or direct imports might be intended.
*   **Language Compatibility:** Code in `libs/` needs to be usable by the target service/application (likely Python for backend, potentially JavaScript/TypeScript if shared with frontend).
*   **Minimizing Coupling:** Be mindful of what goes into `shared/`. Overuse can lead to tight coupling between services, negating some benefits of the microservice architecture. Only share truly common, stable entities.
*   **Versioning:** If publishing as packages, a clear versioning strategy is needed.
*   **Testing:** Shared code should have its own dedicated unit tests.

## 4. Interactions with Other Top-Level Directories

*   **`services/`:** Backend microservices will import types (Pydantic models) and potentially utility libraries from this directory.
*   **`frontend/`:** The frontend application will import types (TypeScript interfaces) from this directory.
*   **`infrastructure/`:** Build processes defined here might need to account for building/linking shared code. 