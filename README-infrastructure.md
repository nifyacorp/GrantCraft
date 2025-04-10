# GrantCraft Infrastructure (`infrastructure/`)

## 1. Overview & Purpose

This directory contains the Infrastructure as Code (IaC) definitions used to provision, configure, and manage the cloud resources required by the GrantCraft application on Google Cloud Platform (GCP) and Firebase.

**Key Goals:**

*   **Automate Provisioning:** Define cloud resources (Cloud Run services, Firestore databases, Storage buckets, IAM policies, etc.) in code for automated setup.
*   **Ensure Consistency:** Guarantee that environments (development, staging, production) are configured identically.
*   **Version Control:** Track changes to infrastructure configuration over time using Git.
*   **Disaster Recovery:** Facilitate repeatable deployments and faster recovery.
*   **Collaboration:** Allow multiple team members to understand and contribute to infrastructure management.

## 2. Proposed Subdirectories

*   **`gcp/`:** Contains IaC definitions specifically for Google Cloud resources. This could use tools like:
    *   **Terraform:** A popular choice for declarative IaC.
    *   **Pulumi:** Allows defining infrastructure using familiar programming languages (Python, TypeScript, etc.).
    *   **Google Cloud Deployment Manager:** GCP's native IaC service.
    *   *(The specific tool needs to be chosen).* This subdirectory would contain configuration files defining Cloud Run services, IAM roles/bindings, Secret Manager secrets, network configurations (if any), monitoring setups, etc.
*   **`firebase/`:** Contains configuration files specific to Firebase services, which might not be fully manageable by standard GCP IaC tools. This could include:
    *   **Firestore Security Rules (`firestore.rules`):** Defines access control for the database.
    *   **Firestore Indexes (`firestore.indexes.json`):** Defines composite indexes needed for queries.
    *   **Firebase Hosting Configuration (`firebase.json`):** If Firebase Hosting were used instead of/alongside Cloud Run for the frontend.
    *   **Realtime Database Rules (`database.rules.json`):** If the Realtime Database were used.

## 3. Key Resources Managed (Examples)

*   **GCP Project Configuration:** Enabling APIs, setting up billing alerts (manual steps often needed initially, but configuration can be codified).
*   **Cloud Run Services:** Definitions for frontend and backend services (memory, CPU, scaling, environment variables, service accounts, secrets integration).
*   **Cloud Storage:** Bucket creation, lifecycle rules, CORS settings, public access prevention.
*   **IAM:** Service accounts, roles, policy bindings (e.g., granting Cloud Run service accounts access to Vertex AI, Secret Manager, Cloud Storage).
*   **Secret Manager:** Definition of secrets (though the *values* should not be stored in Git).
*   **Artifact Registry:** Repositories for storing Docker container images.
*   **Cloud Build:** Triggers for CI/CD pipelines.
*   **Monitoring & Logging:** Alert policies, uptime checks, custom metrics (potentially).
*   **Firebase:** Firestore database settings, security rules, indexes, Authentication configuration (some parts might be manual setup via console initially).

## 4. Key Requirements & Considerations

*   **IaC Tool Selection:** Choose an appropriate IaC tool (Terraform, Pulumi, etc.) based on team expertise and project needs.
*   **State Management:** IaC tools require state management (e.g., Terraform state file). This needs to be stored securely and reliably (e.g., in a GCS bucket).
*   **Secrets Management:** IaC code defines *that* a secret exists and *which* services can access it, but the secret *value* must be managed securely outside of version control (e.g., populated manually in Secret Manager or via a secure pipeline).
*   **Environments:** The IaC code should support deploying to different environments (dev, staging, prod) using variables or workspaces.
*   **CI/CD Integration:** Infrastructure changes should ideally be applied via CI/CD pipelines (e.g., using Cloud Build) with appropriate review and approval steps.
*   **Permissions:** The identity running the IaC deployment (e.g., a Cloud Build service account) needs sufficient permissions to create/modify the defined resources.
*   **Idempotency:** IaC definitions should be idempotent, meaning applying them multiple times results in the same desired state.

## 5. Interactions with Other Top-Level Directories

*   **`services/` & `frontend/`:** IaC defines the Cloud Run services where the containerized applications from these directories are deployed. It also configures environment variables and secrets needed by these applications.
*   **`shared/`:** Build processes orchestrated by CI/CD (potentially defined partially here via Cloud Build triggers) might need to build/link shared code before deploying applications.
*   **`docs/`:** References the architecture diagrams that the infrastructure implements. 