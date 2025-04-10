# GrantCraft Frontend Application (`frontend/`)

## 1. Overview & Purpose

This directory contains the source code for the GrantCraft user interface (UI). It is the primary way users interact with the GrantCraft system.

**Key Responsibilities:**

*   Provide an intuitive and responsive web interface for users.
*   Render application state, including chat history, task lists, and file browsers.
*   Handle user input and interactions (e.g., sending chat messages, uploading files, managing tasks).
*   Manage client-side application state.
*   Interact with the backend services via the `API Gateway` to fetch data and trigger actions.
*   Integrate with Firebase Authentication for user sign-in, sign-up, and session management.

## 2. Technology Stack

*   **Framework:** Next.js (React framework)
*   **Language:** TypeScript (preferred for type safety)
*   **Styling:** (To be determined - e.g., Tailwind CSS, Material UI, custom CSS modules)
*   **State Management:** (To be determined - e.g., React Context API, Zustand, Redux Toolkit)
*   **Deployment:** Containerized and deployed on Cloud Run.

## 3. Core Features & Components

Based on the feature list (`GrantCraft-Features.md`), this application will implement UI components for:

*   **Authentication:** Login/Signup pages, profile management (`AuthComponent`).
*   **Chat Interface:** Message display, input area, context handling (`ChatWindow`).
*   **Task Management:** Task list/board view, task creation/editing modals (`TaskList`).
*   **File Management:** File browser, upload/download controls, file preview (`FileBrowser`).
*   **Tool Interaction:** UI elements to suggest or interact with AI tools (`ToolSelector`).
*   **Navigation:** Main application layout, menus, routing.
*   **Visualization:** Components to render timelines, budgets, or generated images/charts (potentially using libraries like `react-chartjs-2`, `visx`, etc.).
*   **Notifications:** Displaying system messages, progress updates, errors.

## 4. Key Requirements & Considerations

*   **API Interaction:** Needs to securely communicate with the backend API Gateway, handling JWT tokens and API responses.
*   **Authentication:** Must implement robust Firebase Authentication flows (Google Sign-In required for MVP, potentially others).
*   **State Management:** Requires a clear strategy for managing application state effectively (user session, project data, chat context, etc.).
*   **Responsiveness:** UI must adapt to various screen sizes (desktop, tablet, mobile).
*   **Error Handling:** Gracefully handle API errors, network issues, and display informative messages to the user.
*   **Performance:** Optimize loading times, bundle sizes, and rendering performance.
*   **Accessibility:** Adhere to accessibility best practices (WCAG standards).
*   **Real-time Updates:** Implement mechanisms (e.g., WebSockets, polling) for features requiring real-time updates (like chat or task status), if necessary.
*   **Configuration:** Requires environment variables for API endpoints, Firebase configuration, etc. (e.g., via `.env.local` and Cloud Run environment variables).
*   **Testing:** Needs unit tests (e.g., Jest, React Testing Library) for components and potentially end-to-end tests (e.g., Cypress, Playwright) for user flows.

## 5. Interactions with Other Top-Level Directories

*   **`services/`:** Interacts exclusively via the `API Gateway` to access backend functionality.
*   **`shared/`:** May consume shared TypeScript types (`types/`) to ensure consistency with backend data models.
*   **`infrastructure/`:** Defined by IaC configurations for deployment (Cloud Run service definition).
*   **`docs/`:** References design mockups, user flow diagrams, and potentially frontend-specific architectural decisions. 