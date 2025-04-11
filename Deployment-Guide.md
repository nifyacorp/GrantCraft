# GrantCraft Deployment Guide

This document provides step-by-step instructions for deploying the GrantCraft services to Google Cloud Platform (GCP) Cloud Run.

## Prerequisites

- Google Cloud SDK (gcloud) installed and configured
- Docker installed locally
- Access to the GrantCraft GCP project

## Deploying a Service to Cloud Run

The deployment process consists of three main steps:

1. Building the Docker image
2. Pushing the image to GCP's Artifact Registry
3. Deploying the image to Cloud Run

### Step 1: Build the Docker Image

Build the Docker image for the service you want to deploy:

```bash
docker build -t us-central1-docker.pkg.dev/grancraft-final-20240630/grancraft-final-repo/<SERVICE-NAME>:latest ./<SERVICE-DIRECTORY>
```

Example for the frontend:

```bash
docker build -t us-central1-docker.pkg.dev/grancraft-final-20240630/grancraft-final-repo/frontend:latest ./frontend
```

### Step 2: Push the Image to Artifact Registry

Push the built image to Google Cloud Artifact Registry:

```bash
docker push us-central1-docker.pkg.dev/grancraft-final-20240630/grancraft-final-repo/<SERVICE-NAME>:latest
```

Example for the frontend:

```bash
docker push us-central1-docker.pkg.dev/grancraft-final-20240630/grancraft-final-repo/frontend:latest
```

### Step 3: Deploy to Cloud Run

Deploy the image to Cloud Run:

```bash
gcloud run deploy <SERVICE-NAME> \
  --image us-central1-docker.pkg.dev/grancraft-final-20240630/grancraft-final-repo/<SERVICE-NAME>:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

Example for the frontend:

```bash
gcloud run deploy frontend \
  --image us-central1-docker.pkg.dev/grancraft-final-20240630/grancraft-final-repo/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Environment Variables

You can set environment variables for your service using the `--set-env-vars` flag:

```bash
gcloud run deploy <SERVICE-NAME> \
  --image us-central1-docker.pkg.dev/grancraft-final-20240630/grancraft-final-repo/<SERVICE-NAME>:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars="KEY1=VALUE1,KEY2=VALUE2" \
  --allow-unauthenticated
```

Example for the frontend with API URL:

```bash
gcloud run deploy frontend \
  --image us-central1-docker.pkg.dev/grancraft-final-20240630/grancraft-final-repo/frontend:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars="API_URL=https://api-gateway-801375954462.us-central1.run.app" \
  --allow-unauthenticated
```

## Service-Specific Deployment Notes

### Frontend

The frontend requires the API Gateway URL to be configured as an environment variable:

```bash
gcloud run deploy frontend \
  --image us-central1-docker.pkg.dev/grancraft-final-20240630/grancraft-final-repo/frontend:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars="API_URL=https://api-gateway-801375954462.us-central1.run.app" \
  --allow-unauthenticated
```

### API Gateway

The API Gateway needs to be configured with the URLs of the backend services:

```bash
gcloud run deploy api-gateway \
  --image us-central1-docker.pkg.dev/grancraft-final-20240630/grancraft-final-repo/api-gateway:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars="USER_SERVICE_URL=https://user-service-801375954462.us-central1.run.app,FILE_SERVICE_URL=https://file-service-801375954462.us-central1.run.app,CHAT_SERVICE_URL=https://chat-service-801375954462.us-central1.run.app,AGENT_SERVICE_URL=https://agent-service-801375954462.us-central1.run.app,FIREBASE_DISABLED=true" \
  --allow-unauthenticated
```

### Backend Services

Backend services generally don't require specific environment variables, but you may need to set database connection strings or API keys as needed.

## Verifying Deployment

After deployment, you can verify that your service is running by accessing its URL:

```bash
gcloud run services describe <SERVICE-NAME> --platform managed --region us-central1 --format="value(status.url)"
```

You can also check the logs for errors:

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=<SERVICE-NAME>" --limit 20
```

## Troubleshooting

If your deployment fails:

1. Check the logs for error messages
2. Verify that your Docker image builds successfully locally
3. Ensure that your service is listening on the port specified by the `PORT` environment variable (typically 8080 in Cloud Run)
4. Make sure environment variables are correctly set
5. Check that your service account has the necessary permissions 

## Managing Firebase API Keys

For secure handling of Firebase API keys, you have two options:

### Option 1: Environment Variables (Simple but Less Secure)

You can pass Firebase configuration as environment variables during deployment:

```bash
gcloud run deploy <SERVICE-NAME> \
  --image us-central1-docker.pkg.dev/grancraft-final-20240630/grancraft-final-repo/<SERVICE-NAME>:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars="FIREBASE_API_KEY=your-api-key,FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com" \
  --allow-unauthenticated
```

### Option 2: Secret Manager (Recommended for Production)

1. Store your Firebase API key in Secret Manager:

```bash
gcloud secrets create firebase-api-key --replication-policy="automatic"
echo -n "your-firebase-api-key" | gcloud secrets versions add firebase-api-key --data-file=-
```

2. Grant the Cloud Run service account access to the secret:

```bash
gcloud secrets add-iam-policy-binding firebase-api-key \
  --member="serviceAccount:SERVICE-ACCOUNT-EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

3. Reference the secret in your deployment:

```bash
gcloud run deploy <SERVICE-NAME> \
  --image us-central1-docker.pkg.dev/grancraft-final-20240630/grancraft-final-repo/<SERVICE-NAME>:latest \
  --platform managed \
  --region us-central1 \
  --set-secrets="FIREBASE_API_KEY=firebase-api-key:latest" \
  --allow-unauthenticated
```

4. In your code, access the secret value from the environment variable:

```javascript
const firebaseApiKey = process.env.FIREBASE_API_KEY;
```

The Secret Manager approach is more secure for sensitive values like API keys because:
- Secrets are encrypted at rest
- Access is controlled via IAM permissions
- Secret values aren't visible in deployment commands or logs 