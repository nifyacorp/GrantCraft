# Setting Up Automatic Cloud Build for GrantCraft

This guide explains how to set up automatic builds with Cloud Build for the GrantCraft application.

## Prerequisites

1. Google Cloud Platform account with billing enabled
2. Cloud Build API enabled
3. Container Registry API enabled
4. Cloud Run API enabled

## Setup Instructions

### 1. Connect GitHub Repository

1. Go to the [Cloud Build Triggers page](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Connect Repository"
3. Select GitHub as the source
4. Authenticate and select your repository
5. Click "Connect"

### 2. Create Build Trigger

1. Click "Create Trigger"
2. Set up the trigger with these settings:
   - Name: `grantcraft-frontend-build`
   - Event: `Push to a branch`
   - Source: Your GitHub repository
   - Branch: `^main$` (regex for exact match on main branch)
   - Configuration: `Cloud Build configuration file (yaml or json)`
   - Location: `Repository`
   - Cloud Build configuration file location: `next/cloudbuild.yaml`

3. Click "Create"

### 3. Set Up Environment Variables

For Cloud Run to have access to environment variables during runtime (not build time), set these variables in the Cloud Run service configuration:

```bash
gcloud run services update grantcraft-frontend \
  --set-env-vars NEXTAUTH_URL=https://grantcraft-frontend-320165158819.us-central1.run.app \
  --set-env-vars NEXTAUTH_SECRET=your_secret_value \
  --set-env-vars NEXT_PUBLIC_BACKEND_URL=https://grantcraft-backend-320165158819.us-central1.run.app \
  --set-env-vars DATABASE_URL=your_database_url \
  --set-env-vars SKIP_ENV_VALIDATION=true
```

Replace `your_secret_value` and `your_database_url` with your actual values.

### 4. Understanding the Build Process

Our setup uses these components:

1. **cloudbuild.yaml**: Creates a `.env.production` file with `SKIP_ENV_VALIDATION=true` to bypass environment validation during build.

2. **Dockerfile**: 
   - Sets `SKIP_ENV_VALIDATION=true` in the container
   - Copies `.env.production` if available
   - Builds the application during image creation
   - Production environment variables are only needed at runtime, not build time

3. **entrypoint.sh**:
   - Sets default values for environment variables if they're not provided
   - Only rebuilds the application if necessary

### 5. Verifying the Setup

After setting up the trigger:

1. Make a commit to your `main` branch and push it
2. Go to the [Cloud Build History page](https://console.cloud.google.com/cloud-build/builds) to monitor the build
3. Once complete, verify your Cloud Run service is updated

## Troubleshooting

If builds fail, check:

1. **Build logs** for specific errors
2. Ensure `SKIP_ENV_VALIDATION=true` is set in both `.env.production` and as an environment variable
3. Verify the Cloud Build service account has necessary permissions
4. Confirm Docker build completes successfully

For runtime errors, check Cloud Run logs to see if environment variables are properly available at runtime.