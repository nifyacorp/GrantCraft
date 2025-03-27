#!/bin/bash

# Set your project ID
PROJECT_ID=grantcraft
REGION=us-central1
STORAGE_BUCKET=agentgpt-files-$PROJECT_ID
FRONTEND_NAME=agentgpt-frontend
BACKEND_NAME=agentgpt-platform
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 12)

# Expected service URLs based on grantcraft format
FRONTEND_URL=https://$FRONTEND_NAME-320165158819.$REGION.run.app
BACKEND_URL=https://$BACKEND_NAME-320165158819.$REGION.run.app

echo "Using the following configuration:"
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo "NextAuth Secret: $NEXTAUTH_SECRET"
echo "Database Password: $DB_PASSWORD"
echo "OpenAI API Key will be loaded from Secret Manager"

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sql.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com

# Create Storage Bucket
echo "Creating storage bucket..."
gcloud storage buckets create gs://$STORAGE_BUCKET --location=$REGION || true

# Create Cloud SQL instance
echo "Creating Cloud SQL instance..."
gcloud sql instances create agentgpt-mysql \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=$REGION \
  --root-password=$DB_PASSWORD \
  --database-flags=character_set_server=utf8mb4,collation_server=utf8mb4_unicode_ci || true

# Create database and user
echo "Creating database and user..."
gcloud sql databases create reworkd_platform --instance=agentgpt-mysql || true
gcloud sql users create reworkd_platform \
  --instance=agentgpt-mysql \
  --password=$DB_PASSWORD || true

# Build and deploy using Cloud Build
echo "Building Docker images with Cloud Build..."
gcloud builds submit --config deployment/gcp-cloudbuild.yaml

# Deploy Frontend to Cloud Run
echo "Deploying frontend to Cloud Run..."
gcloud run deploy $FRONTEND_NAME \
  --image gcr.io/$PROJECT_ID/agentgpt-frontend \
  --platform managed \
  --region=$REGION \
  --allow-unauthenticated \
  --set-env-vars NEXTAUTH_URL=$FRONTEND_URL \
  --set-env-vars NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
  --set-env-vars NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL \
  --set-env-vars NEXT_PUBLIC_FORCE_AUTH=false \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID \
  --set-env-vars GCP_STORAGE_BUCKET=$STORAGE_BUCKET \
  --set-env-vars SKIP_ENV_VALIDATION=true \
  --set-env-vars DATABASE_URL="mysql://reworkd_platform:${DB_PASSWORD}@localhost/reworkd_platform?socket=/cloudsql/$PROJECT_ID:$REGION:agentgpt-mysql"

# Deploy Backend to Cloud Run
echo "Deploying backend to Cloud Run..."
gcloud run deploy $BACKEND_NAME \
  --image gcr.io/$PROJECT_ID/agentgpt-platform \
  --platform managed \
  --region=$REGION \
  --allow-unauthenticated \
  --set-env-vars REWORKD_PLATFORM_HOST=0.0.0.0 \
  --set-env-vars REWORKD_PLATFORM_FRONTEND_URL=$FRONTEND_URL \
  --update-secrets=REWORKD_PLATFORM_OPENAI_API_KEY=openai-api-key:latest \
  --set-env-vars REWORKD_PLATFORM_DB_HOST=/cloudsql/$PROJECT_ID:$REGION:agentgpt-mysql \
  --set-env-vars REWORKD_PLATFORM_DB_PORT=3306 \
  --set-env-vars REWORKD_PLATFORM_DB_USER=reworkd_platform \
  --set-env-vars REWORKD_PLATFORM_DB_PASS=$DB_PASSWORD \
  --set-env-vars REWORKD_PLATFORM_DB_BASE=reworkd_platform \
  --set-env-vars REWORKD_PLATFORM_GCP_PROJECT_ID=$PROJECT_ID \
  --set-env-vars REWORKD_PLATFORM_GCP_STORAGE_BUCKET=$STORAGE_BUCKET \
  --add-cloudsql-instances $PROJECT_ID:$REGION:agentgpt-mysql

echo "Deployment complete!"
echo "You can access your application at: $FRONTEND_URL"
echo ""
echo "If you need to manually update configuration:"
echo "1. Frontend URL: $FRONTEND_URL"
echo "2. Backend URL: $BACKEND_URL"
echo "3. NextAuth Secret: $NEXTAUTH_SECRET"
echo "4. Database Password: $DB_PASSWORD"
echo ""
echo "Make sure to securely store these values!"