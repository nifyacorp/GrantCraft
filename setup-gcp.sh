#!/bin/bash
set -e

# Default values
PROJECT_ID="grancraft"
REGION="us-central1"
BILLING_ACCOUNT=""

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --project-id) PROJECT_ID="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        --billing-account) BILLING_ACCOUNT="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

if [ -z "$BILLING_ACCOUNT" ]; then
    echo "Please provide a billing account with --billing-account"
    exit 1
fi

echo "Setting up GCP project $PROJECT_ID in $REGION..."

# Create the GCP project
gcloud projects create $PROJECT_ID --name="GranCraft"

# Link billing account
gcloud billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT

# Set the project as the default
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable aiplatform.googleapis.com

# Create Artifact Registry repository
echo "Creating Artifact Registry repository..."
gcloud artifacts repositories create grancraft-repo \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for GranCraft"

# Create Cloud Storage bucket
echo "Creating Cloud Storage bucket..."
gsutil mb -l $REGION gs://$PROJECT_ID-files

# Setup Firestore
echo "Setting up Firestore..."
gcloud firestore databases create --region=$REGION

# Set up Cloud Build GitHub integration
echo "To set up GitHub integration:"
echo "1. Go to https://console.cloud.google.com/cloud-build/triggers"
echo "2. Connect your GitHub repository"
echo "3. Create a trigger that points to the cloudbuild.yaml file"

echo "Setup complete! Your GCP project is ready." 