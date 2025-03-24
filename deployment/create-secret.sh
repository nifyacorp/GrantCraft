#!/bin/bash

# This script creates a GCP Secret Manager secret for the OpenAI API key
# You can use this if you prefer not to use environment variables

# Set your project ID
PROJECT_ID=grantcraft

# Check if API key is provided
if [ $# -ne 1 ]; then
  echo "Usage: $0 <openai-api-key>"
  echo "Example: $0 sk-xxxxxxxxxxxx"
  exit 1
fi

# Get the API key from command line argument
OPENAI_API_KEY=$1

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create the secret
echo "Creating secret for OpenAI API key..."
echo -n $OPENAI_API_KEY | gcloud secrets create openai-api-key \
  --replication-policy="automatic" \
  --data-file=-

# Grant Cloud Run service account access to the secret
echo "Granting Cloud Run service account access to secret..."
SERVICE_ACCOUNT=$(gcloud iam service-accounts list --filter="EMAIL:service-account@${PROJECT_ID}.iam.gserviceaccount.com" --format="value(EMAIL)")
gcloud secrets add-iam-policy-binding openai-api-key \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

echo "Secret created and permissions granted."
echo ""
echo "To deploy the backend using this secret, update the command to use Secret Manager:"
echo "gcloud run deploy agentgpt-platform \\"
echo "  ... other arguments ... \\"
echo "  --update-secrets=REWORKD_PLATFORM_OPENAI_API_KEY=openai-api-key:latest \\"
echo "  ... remaining arguments ..."