# Deploying AgentGPT on Google Cloud Platform

## Prerequisites

1. Google Cloud account with billing enabled
2. Google Cloud SDK installed (`gcloud` command line tool)
3. Docker installed locally

## Setup GCP Resources

### Create Storage Bucket

```bash
gcloud storage buckets create gs://agentgpt-files-grantcraft
```

### Create Cloud Run Services

1. Build and deploy the frontend:

```bash
# Navigate to the frontend directory
cd next

# Build the Docker image
gcloud builds submit --tag gcr.io/grantcraft/agentgpt-frontend

# Deploy to Cloud Run
gcloud run deploy agentgpt-frontend \
  --image gcr.io/grantcraft/agentgpt-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXTAUTH_URL=<your-frontend-url>.run.app \
  --set-env-vars NEXTAUTH_SECRET=<random-string> \
  --set-env-vars NEXT_PUBLIC_BACKEND_URL=<your-backend-url>.run.app \
  --set-env-vars NEXT_PUBLIC_FORCE_AUTH=false
```

2. Deploy the MySQL database (Cloud SQL):

```bash
gcloud sql instances create agentgpt-mysql \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=reworkd_platform \
  --database-flags=character_set_server=utf8mb4,collation_server=utf8mb4_unicode_ci

# Create the database
gcloud sql databases create reworkd_platform --instance=agentgpt-mysql

# Create the user
gcloud sql users create reworkd_platform \
  --instance=agentgpt-mysql \
  --password=reworkd_platform
```

3. Deploy the backend:

```bash
# Navigate to the platform directory
cd platform

# Build the Docker image
gcloud builds submit --tag gcr.io/grantcraft/agentgpt-platform

# Deploy to Cloud Run
gcloud run deploy agentgpt-platform \
  --image gcr.io/grantcraft/agentgpt-platform \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars REWORKD_PLATFORM_HOST=0.0.0.0 \
  --set-env-vars REWORKD_PLATFORM_FRONTEND_URL=<your-frontend-url>.run.app \
  --set-env-vars REWORKD_PLATFORM_OPENAI_API_KEY=<your-openai-api-key> \
  --set-env-vars REWORKD_PLATFORM_DB_HOST=/cloudsql/grantcraft:us-central1:agentgpt-mysql \
  --set-env-vars REWORKD_PLATFORM_DB_PORT=3306 \
  --set-env-vars REWORKD_PLATFORM_DB_USER=reworkd_platform \
  --set-env-vars REWORKD_PLATFORM_DB_PASS=reworkd_platform \
  --set-env-vars REWORKD_PLATFORM_DB_BASE=reworkd_platform \
  --add-cloudsql-instances grantcraft:us-central1:agentgpt-mysql
```

## Environment Configuration

Create a `.env` file in the `next` directory with the following variables:

```
NEXTAUTH_URL=<your-frontend-url>.run.app
NEXTAUTH_SECRET=<random-string>
NEXT_PUBLIC_BACKEND_URL=<your-backend-url>.run.app
NEXT_PUBLIC_FORCE_AUTH=false

# OpenAI
OPENAI_API_KEY=<your-openai-api-key>

# Database
RWORKD_PLATFORM_DB_HOST=/cloudsql/grantcraft:us-central1:agentgpt-mysql
RWORKD_PLATFORM_DB_PORT=3306
RWORKD_PLATFORM_DB_USER=reworkd_platform
RWORKD_PLATFORM_DB_PASS=reworkd_platform
RWORKD_PLATFORM_DB_BASE=reworkd_platform

# GCP Storage
GOOGLE_CLOUD_PROJECT=grantcraft
GCP_STORAGE_BUCKET=agentgpt-files-grantcraft
```

## Local Development with GCP Resources

For local development using GCP resources:

1. Set up application default credentials:

```bash
gcloud auth application-default login
```

2. Run the application using Docker Compose:

```bash
docker-compose -f docker-compose.yml up
```

This will use the GCP resources configured in your `.env` file while running the application locally.
