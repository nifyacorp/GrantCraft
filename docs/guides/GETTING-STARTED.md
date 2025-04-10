# GrantCraft Google Cloud - Getting Started Guide

This guide will walk you through setting up the GrantCraft system on Google Cloud Platform from scratch.

## Prerequisites

Before you begin, you'll need:

1. A Google Cloud Platform account
2. The [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
3. [Node.js](https://nodejs.org/) v18 or newer
4. [Python](https://www.python.org/downloads/) 3.9 or newer
5. [Poetry](https://python-poetry.org/docs/#installation) for Python dependency management
6. [Git](https://git-scm.com/downloads)

## Project Setup

### Step 1: Set up Google Cloud Project

1. Create a new Google Cloud project
   ```bash
   # Create a new project
   gcloud projects create grant-craft-app --name="GrantCraft"
   
   # Set the project as your current project
   gcloud config set project grant-craft-app
   ```

2. Enable required APIs
   ```bash
   gcloud services enable cloudbuild.googleapis.com \
     run.googleapis.com \
     artifactregistry.googleapis.com \
     firebase.googleapis.com \
     firestore.googleapis.com \
     aiplatform.googleapis.com \
     secretmanager.googleapis.com
   ```

### Step 2: Set up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and select your Google Cloud project
3. Follow the setup wizard to configure Firebase

4. Set up Authentication:
   - Go to "Authentication" in the Firebase console
   - Click "Get started"
   - Enable "Google" as a sign-in provider
   - Add any other providers you want to support (GitHub, email/password, etc.)

5. Set up Firestore:
   - Go to "Firestore Database" in the Firebase console
   - Click "Create database"
   - Start in production mode
   - Choose a location closest to your users

### Step 3: Set up Cloud Storage

1. Create a storage bucket
   ```bash
   gsutil mb -l us-central1 gs://grant-craft-files
   ```

2. Set public access prevention
   ```bash
   gsutil pap set enforced gs://grant-craft-files
   ```

### Step 4: Set up Vertex AI

1. Enable Vertex AI API if not already enabled
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

2. Create a Vertex AI service account
   ```bash
   gcloud iam service-accounts create vertex-ai-user \
     --display-name="Vertex AI User"
   ```

3. Grant necessary permissions
   ```bash
   gcloud projects add-iam-policy-binding grant-craft-app \
     --member="serviceAccount:vertex-ai-user@grant-craft-app.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

4. Create and download a service account key (for local development only)
   ```bash
   gcloud iam service-accounts keys create vertex-key.json \
     --iam-account=vertex-ai-user@grant-craft-app.iam.gserviceaccount.com
   ```

5. Store the key securely and configure environment variables
   ```bash
   # Add to your .env file
   GOOGLE_APPLICATION_CREDENTIALS=./vertex-key.json
   ```

6. For production deployment, assign this service account to the backend Cloud Run service
   ```bash
   # This will be done in the deployment step
   gcloud run services update backend-service \
     --service-account=vertex-ai-user@grant-craft-app.iam.gserviceaccount.com
   ```

### Step 5: Set up Secret Manager

1. Enable the Secret Manager API
   ```bash
   gcloud services enable secretmanager.googleapis.com
   ```

2. Create secrets for your application
   ```bash
   # Create a secret for Firebase config
   echo -n '{"apiKey":"your_api_key","authDomain":"your_project.firebaseapp.com","projectId":"your_project_id","storageBucket":"your_storage_bucket","messagingSenderId":"your_sender_id","appId":"your_app_id"}' | \
   gcloud secrets create firebase-config --data-file=-

   # Create a secret for backend API keys
   echo -n 'your-api-key-here' | \
   gcloud secrets create backend-api-key --data-file=-
   ```

3. Grant the service accounts access to secrets
   ```bash
   # Grant backend service account access to secrets
   gcloud secrets add-iam-policy-binding firebase-config \
     --member="serviceAccount:vertex-ai-user@grant-craft-app.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   
   gcloud secrets add-iam-policy-binding backend-api-key \
     --member="serviceAccount:vertex-ai-user@grant-craft-app.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

4. Update the backend code to access secrets
   ```python
   from google.cloud import secretmanager

   def access_secret(project_id, secret_id, version_id="latest"):
       client = secretmanager.SecretManagerServiceClient()
       name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
       response = client.access_secret_version(request={"name": name})
       return response.payload.data.decode('UTF-8')
   
   # Usage
   firebase_config = access_secret("grant-craft-app", "firebase-config")
   ```

### Step 6: Clone the Repository

```bash
git clone https://github.com/your-username/grant-craft-gcp.git
cd grant-craft-gcp
```

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env.local` file:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

You can get these values from your Firebase project settings.

### Step 3: Run Development Server

```bash
npm run dev
```

Your frontend should now be running at `http://localhost:3000`.

## Backend Setup

### Step 1: Install Dependencies

```bash
cd ../backend
poetry install
```

### Step 2: Configure Environment Variables

Create a `.env` file:

```
# Google Cloud Configuration
GCP_PROJECT_ID=grant-craft-app
GCP_LOCATION=us-central1

# Firebase Configuration
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-key.json

# Vertex AI Configuration
VERTEX_AI_LOCATION=us-central1

# API Configuration
API_PREFIX=/api
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

### Step 3: Set up Firebase Admin SDK

1. Download your Firebase Admin SDK key:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the file as `firebase-key.json` in the backend directory

### Step 4: Run Development Server

```bash
poetry run uvicorn app.main:app --reload
```

Your backend should now be running at `http://localhost:8000`.

## Deployment

### Deploy Frontend to Cloud Run

1. Build and push the container
   ```bash
   cd frontend
   gcloud builds submit --tag gcr.io/grant-craft-app/frontend
   ```

2. Deploy to Cloud Run
   ```bash
   gcloud run deploy frontend-service \
     --image gcr.io/grant-craft-app/frontend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="NODE_ENV=production" \
     --memory 1Gi \
     --cpu 1 \
     --concurrency 80 \
     --max-instances 10
   ```

### Deploy Backend to Cloud Run

1. Build and push the container
   ```bash
   cd ../backend
   gcloud builds submit --tag gcr.io/grant-craft-app/backend
   ```

2. Deploy to Cloud Run with the service account and secret access
   ```bash
   gcloud run deploy backend-service \
     --image gcr.io/grant-craft-app/backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --service-account=vertex-ai-user@grant-craft-app.iam.gserviceaccount.com \
     --set-env-vars="GCP_PROJECT_ID=grant-craft-app,GCP_LOCATION=us-central1,VERTEX_AI_LOCATION=us-central1" \
     --set-secrets="FIREBASE_CONFIG=firebase-config:latest" \
     --memory 2Gi \
     --cpu 2 \
     --concurrency 30 \
     --max-instances 10 \
     --min-instances 1
   ```

3. Configure domain mapping (optional)
   ```bash
   gcloud beta run domain-mappings create \
     --service=backend-service \
     --domain=api.yourdomainname.com \
     --region=us-central1
   
   gcloud beta run domain-mappings create \
     --service=frontend-service \
     --domain=app.yourdomainname.com \
     --region=us-central1
   ```

4. Setup IAM policies for invoker access
   ```bash
   # Allow frontend to call backend (if needed)
   gcloud run services add-iam-policy-binding backend-service \
     --member="serviceAccount:frontend-service@grant-craft-app.iam.gserviceaccount.com" \
     --role="roles/run.invoker" \
     --region=us-central1
   ```

5. Update the frontend to use the deployed backend URL
   ```bash
   # Get the backend URL
   BACKEND_URL=$(gcloud run services describe backend-service --region=us-central1 --format="value(status.url)")
   
   # Update frontend configuration
   gcloud run services update frontend-service \
     --platform managed \
     --region us-central1 \
     --set-env-vars="NEXT_PUBLIC_API_URL=${BACKEND_URL}/api"
   ```

### Setup Cloud Monitoring

1. Create uptime checks for services
   ```bash
   # Create uptime check for backend API health endpoint
   gcloud monitoring uptime-check-configs create backend-uptime-check \
     --display-name="Backend API Uptime" \
     --http-check-path="/api/health" \
     --http-check-port=443 \
     --timeout=10s \
     --period=300s \
     --resource-type=uptime-url \
     --resource-labels=host=$(echo $BACKEND_URL | cut -d'/' -f3),project-id=grant-craft-app
   ```

2. Create alert policies for critical services
   ```bash
   # Create alert for 5xx errors on backend API
   gcloud alpha monitoring policies create \
     --display-name="Backend 5xx Error Rate" \
     --condition-filter="metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND metric.labels.response_code_class=\"5xx\" AND resource.labels.service_name=\"backend-service\"" \
     --condition-threshold-value=5 \
     --condition-threshold-duration=300s \
     --condition-aggregation-period=300s \
     --condition-comparison="COMPARISON_GT" \
     --notification-channels="projects/grant-craft-app/notificationChannels/your-notification-channel-id"
   ```

## Next Steps

1. Customize the frontend UI components
2. Extend the AI agent capabilities
3. Add more tools for document preparation
4. Set up monitoring and alerts
5. Implement advanced features like:
   - User collaboration
   - Export options
   - Advanced file management
   - Custom AI models

## Troubleshooting

### Common Issues

1. **Firebase Authentication Issues**
   - Check the Firebase console for errors
   - Verify the Firebase configuration in your env files
   - Ensure your OAuth redirect URIs are properly configured

2. **Cloud Run Deployment Issues**
   - Check the Cloud Run logs: `gcloud run services logs read service-name`
   - Verify that your service account has the necessary permissions
   - Check for environment variable issues

3. **Vertex AI Issues**
   - Verify the API is enabled
   - Check that your service account has the proper permissions
   - Check the API quotas and limits

4. **Connection Issues Between Services**
   - Verify the CORS configuration
   - Check the API URLs in your environment variables
   - Ensure your services can communicate with each other

## Resources

- [Google Cloud Platform Documentation](https://cloud.google.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/) 