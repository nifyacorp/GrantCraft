# GranCraft Deployment Guide

This guide provides step-by-step instructions for deploying the GranCraft application to Google Cloud Platform (GCP) with continuous integration from GitHub.

## Prerequisites

1. A Google Cloud Platform account with billing enabled
2. Google Cloud SDK (gcloud) installed locally
3. GitHub repository for the project
4. Docker installed locally (for testing)

## Initial Setup

### 1. Set up the GCP project

Run the setup script:

```bash
# Make the script executable
chmod +x setup-gcp.sh

# Run the script with your billing account ID
./setup-gcp.sh --project-id grancraft --billing-account YOUR_BILLING_ACCOUNT_ID
```

### 2. Enable GitHub Integration

1. Go to the Cloud Build section in the GCP Console
2. Connect your GitHub repository
3. Create a new trigger:
   - Name: `main-branch-deploy`
   - Event: `Push to a branch`
   - Source: `^main$`
   - Configuration: `Cloud Build configuration file (yaml or json)`
   - Location: `Repository`
   - Cloud Build configuration file location: `cloudbuild.yaml`

## Deployment Options

### Automatic Deployment (GitHub Integration)

With the GitHub integration set up, every push to the main branch will trigger a build and deployment according to the `cloudbuild.yaml` configuration.

### Manual Deployment

To manually deploy the entire project:

```bash
npm run deploy
```

To deploy only the frontend:

```bash
npm run deploy:frontend
```

## Service URLs

After deployment, your services will be available at:

- Frontend: `https://frontend-[hash].run.app`
- File Service: `https://file-service-[hash].run.app`
- (Other services similarly named)

## Environment Configuration

Each service requires environment variables to be set up. You can set these through the Cloud Run console or via the gcloud command:

```bash
gcloud run services update SERVICE_NAME --set-env-vars="KEY1=VALUE1,KEY2=VALUE2"
```

For secure values, use Secret Manager:

```bash
# Create a secret
gcloud secrets create SECRET_NAME --replication-policy="automatic" --data-file=secret-file.txt

# Grant access to the Cloud Run service
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

## Troubleshooting

If you encounter issues:

1. Check the Cloud Build logs for build failures
2. Check the Cloud Run logs for runtime errors
3. Verify that all necessary APIs are enabled
4. Ensure proper IAM permissions are set up

## Database Migration

To initialize or migrate the Firestore database:

1. Ensure the Firestore API is enabled
2. Navigate to the Firestore console and create necessary indexes

## Next Steps

After successful deployment:

1. Set up Firebase Authentication
2. Configure Firestore security rules
3. Set up monitoring and alerts
4. Add custom domains for your services 