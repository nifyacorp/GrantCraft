#!/bin/bash
set -e

echo "Testing Google Cloud CLI configuration..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "ERROR: gcloud CLI is not installed"
    echo "Please install the Google Cloud SDK from https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
ACCOUNT=$(gcloud config get-value account 2>/dev/null)
if [ -z "$ACCOUNT" ]; then
    echo "ERROR: You are not logged in to Google Cloud"
    echo "Please run: gcloud auth login"
    exit 1
fi
echo "✓ Authenticated as: $ACCOUNT"

# Check if project is set
PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT" ]; then
    echo "WARNING: No default project is set"
    echo "Please run: gcloud config set project YOUR_PROJECT_ID"
else
    echo "✓ Default project: $PROJECT"
fi

# Check if required APIs are enabled
echo "Checking required APIs (this may take a moment)..."
APIS_TO_CHECK=(
    "cloudbuild.googleapis.com"
    "run.googleapis.com"
    "artifactregistry.googleapis.com"
    "firestore.googleapis.com"
    "storage.googleapis.com"
)

if [ ! -z "$PROJECT" ]; then
    for api in "${APIS_TO_CHECK[@]}"; do
        if gcloud services list --project=$PROJECT --filter="name:$api" --format="value(name)" | grep -q "$api"; then
            echo "✓ $api is enabled"
        else
            echo "✗ $api is NOT enabled. To enable, run: gcloud services enable $api"
        fi
    done
else
    echo "Skipping API check since no project is set"
fi

echo -e "\nGCP CLI configuration test complete!"
echo "If you need to set up the project, run: ./setup-gcp.sh --project-id YOUR_PROJECT_ID --billing-account YOUR_BILLING_ACCOUNT_ID" 