# OWL Cloud Run Deployment Guide

This guide explains how to deploy the OWL application to Google Cloud Run.

## Prerequisites

1. Google Cloud account with billing enabled
2. gcloud CLI installed and configured
3. API keys for the services used by OWL (OpenAI, etc.)

## Deployment Steps

### Option 1: Automated Deployment with Cloud Build

1. **Connect your GitHub repository to Cloud Build**
   - Go to Cloud Build > Triggers
   - Connect your repository
   - Create a trigger that uses the `cloudbuild.yaml` configuration

2. **Set up required environment variables**
   - Go to Cloud Run > Service > Configuration > Variables
   - Add the following environment variables:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `GRADIO_SERVER_NAME`: 0.0.0.0
     - `GRADIO_SERVER_PORT`: 8080
     - Any other API keys needed for your toolkits (see `.env_template` for reference)

3. **Run the build trigger**
   - This will build and deploy the application to Cloud Run

### Option 2: Manual Deployment

1. **Build the Docker image**
   ```bash
   docker build -t gcr.io/[PROJECT_ID]/owl-app -f Dockerfile.cloudrun .
   ```

2. **Push to Google Container Registry**
   ```bash
   docker push gcr.io/[PROJECT_ID]/owl-app
   ```

3. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy owl-app \
     --image gcr.io/[PROJECT_ID]/owl-app \
     --platform managed \
     --region us-central1 \
     --port 8080 \
     --memory 4Gi \
     --cpu 2 \
     --timeout 3600s \
     --set-env-vars OPENAI_API_KEY=[YOUR_API_KEY],GRADIO_SERVER_NAME=0.0.0.0,GRADIO_SERVER_PORT=8080
   ```

## Important Notes

- Cloud Run has a **request timeout limit of 60 minutes**, which should be sufficient for most OWL tasks
- The deployment is configured with 4GB memory and 2 CPUs, which may need adjustment based on your usage
- The container is configured to expose port 8080, which is the default port for Cloud Run
- For browser-based operations, the application uses a headless browser with Xvfb

## Security Considerations

- Store API keys securely using Secret Manager
- Consider restricting access to the Cloud Run service based on your requirements
- Review Cloud Run logs regularly for any unauthorized access attempts

## Troubleshooting

- If the service fails to start, check Cloud Run logs for errors
- For browser automation issues, you may need to adjust the Xvfb configuration
- For memory-related issues, increase the memory allocation in Cloud Run configuration