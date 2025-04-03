#!/bin/bash

# Set this to your Google Cloud project ID
PROJECT_ID="grantcraft"

# Build and deploy the platform
echo "Building and deploying backend with CORS headers..."
gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID

echo "Deployment complete. Check the Cloud Run console for the service status."