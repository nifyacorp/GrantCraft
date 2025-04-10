#!/bin/bash
set -e

# Default values
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_ACCOUNT="grancraft-deploy@$PROJECT_ID.iam.gserviceaccount.com"
DEPLOY_ALL=false

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --project-id) PROJECT_ID="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        --service-account) SERVICE_ACCOUNT="$2"; shift ;;
        --all) DEPLOY_ALL=true ;;
        --frontend) DEPLOY_FRONTEND=true ;;
        --file-service) DEPLOY_FILE_SERVICE=true ;;
        --chat-service) DEPLOY_CHAT_SERVICE=true ;;
        --agent-service) DEPLOY_AGENT_SERVICE=true ;;
        --user-service) DEPLOY_USER_SERVICE=true ;;
        --project-service) DEPLOY_PROJECT_SERVICE=true ;;
        --task-service) DEPLOY_TASK_SERVICE=true ;;
        --api-gateway) DEPLOY_API_GATEWAY=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo "Deploying to project: $PROJECT_ID in region: $REGION"
echo "Using service account: $SERVICE_ACCOUNT"

# Set the default project
gcloud config set project $PROJECT_ID

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local service_dir=$2
    
    echo "Deploying $service_name from $service_dir..."
    
    # Build and push Docker image
    docker build -t gcr.io/$PROJECT_ID/$service_name:latest $service_dir
    docker push gcr.io/$PROJECT_ID/$service_name:latest
    
    # Deploy to Cloud Run
    gcloud run deploy $service_name \
        --image gcr.io/$PROJECT_ID/$service_name:latest \
        --platform managed \
        --region $REGION \
        --service-account $SERVICE_ACCOUNT \
        ${3:-} # Additional parameters if provided
}

# Deploy Frontend
if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_FRONTEND" = true ]; then
    deploy_service "frontend" "./frontend" "--allow-unauthenticated"
fi

# Deploy File Service
if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_FILE_SERVICE" = true ]; then
    deploy_service "file-service" "./services/file-service"
fi

# Deploy Chat Service
if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_CHAT_SERVICE" = true ]; then
    deploy_service "chat-service" "./services/chat-service"
fi

# Deploy Agent Service
if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_AGENT_SERVICE" = true ]; then
    deploy_service "agent-service" "./services/agent-service"
fi

# Deploy User Service
if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_USER_SERVICE" = true ]; then
    deploy_service "user-service" "./services/user-service"
fi

# Deploy Project Service
if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_PROJECT_SERVICE" = true ]; then
    deploy_service "project-service" "./services/project-service"
fi

# Deploy Task Service
if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_TASK_SERVICE" = true ]; then
    deploy_service "task-service" "./services/task-service"
fi

# Deploy API Gateway
if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_API_GATEWAY" = true ]; then
    deploy_service "api-gateway" "./services/api-gateway" "--allow-unauthenticated"
fi

echo "Deployment completed!" 