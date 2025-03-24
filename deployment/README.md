# Deploying AgentGPT to Google Cloud Platform

This directory contains scripts and configuration for deploying AgentGPT to Google Cloud Platform.

## Quick Start

1. Make sure you have the Google Cloud SDK installed and initialized:
   ```bash
   gcloud auth login
   gcloud config set project grantcraft
   ```

2. Set your OpenAI API key as an environment variable:
   ```bash
   export OPENAI_API_KEY=your_openai_api_key
   ```

3. Make the deployment script executable and run it:
   ```bash
   chmod +x deployment/cloudbuild-commands.sh
   ./deployment/cloudbuild-commands.sh
   ```

The script will:
- Set up random secure passwords for the database and authentication
- Create a Cloud Storage bucket
- Set up a Cloud SQL MySQL instance
- Build Docker images for the frontend and backend
- Deploy to Cloud Run
- Configure all environment variables with your OpenAI API key

## Manual Configuration

If you need to manually configure services, use the following commands:

### Frontend

```bash
gcloud run deploy agentgpt-frontend \
  --image gcr.io/grantcraft/agentgpt-frontend \
  --platform managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXTAUTH_URL=https://agentgpt-frontend-320165158819.us-central1.run.app \
  --set-env-vars NEXTAUTH_SECRET=your_secret \
  --set-env-vars NEXT_PUBLIC_BACKEND_URL=https://agentgpt-platform-320165158819.us-central1.run.app \
  --set-env-vars NEXT_PUBLIC_FORCE_AUTH=false
```

### Backend

```bash
# First set your OpenAI API key
export OPENAI_API_KEY=your_openai_api_key

gcloud run deploy agentgpt-platform \
  --image gcr.io/grantcraft/agentgpt-platform \
  --platform managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --set-env-vars REWORKD_PLATFORM_HOST=0.0.0.0 \
  --set-env-vars REWORKD_PLATFORM_FRONTEND_URL=https://agentgpt-frontend-320165158819.us-central1.run.app \
  --set-env-vars "REWORKD_PLATFORM_OPENAI_API_KEY=${OPENAI_API_KEY}" \
  --set-env-vars REWORKD_PLATFORM_DB_HOST=/cloudsql/grantcraft:us-central1:agentgpt-mysql \
  --set-env-vars REWORKD_PLATFORM_DB_PORT=3306 \
  --set-env-vars REWORKD_PLATFORM_DB_USER=reworkd_platform \
  --set-env-vars REWORKD_PLATFORM_DB_PASS=your_db_password \
  --set-env-vars REWORKD_PLATFORM_DB_BASE=reworkd_platform \
  --set-env-vars REWORKD_PLATFORM_GCP_PROJECT_ID=grantcraft \
  --set-env-vars REWORKD_PLATFORM_GCP_STORAGE_BUCKET=agentgpt-files-grantcraft \
  --add-cloudsql-instances grantcraft:us-central1:agentgpt-mysql
```