# GrantCraft Deployment Checklist

This checklist will help you deploy working GrantCraft services to Cloud Run, addressing the issues we've found.

## Frontend Deployment

### Prepare Environment File

1. Create a `.env` file with authentication disabled:
   ```
   # Disable authentication completely
   NEXT_PUBLIC_FF_AUTH_ENABLED=false
   
   # Enable mock mode for testing without backend
   NEXT_PUBLIC_FF_MOCK_MODE_ENABLED=true
   
   # Set necessary environment variables
   NEXTAUTH_SECRET=local_development_secret
   NEXTAUTH_URL=https://grantcraft-frontend-320165158819.us-central1.run.app
   NEXT_PUBLIC_BACKEND_URL=https://grantcraft-backend-320165158819.us-central1.run.app
   ```

### Build and Deploy Frontend

1. Build the Docker image with our modified Dockerfile:
   ```bash
   cd next
   docker build -t gcr.io/YOUR_PROJECT_ID/grantcraft-frontend .
   ```

2. Push the image to GCR:
   ```bash
   docker push gcr.io/YOUR_PROJECT_ID/grantcraft-frontend
   ```

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy grantcraft-frontend \
     --image gcr.io/YOUR_PROJECT_ID/grantcraft-frontend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --update-env-vars "NEXT_PUBLIC_FF_AUTH_ENABLED=false,NEXT_PUBLIC_FF_MOCK_MODE_ENABLED=true"
   ```

## Backend Deployment

### Fix Backend Dockerfile Issues

1. Create an entrypoint check to verify the app is running:
   ```bash
   # Add to platform/entrypoint.sh
   echo "Starting FastAPI application..."
   echo "Python version: $(python --version)"
   echo "Working directory: $(pwd)"
   echo "Files in current directory:"
   ls -la
   ```

2. Update the platform Dockerfile:
   ```dockerfile
   # in platform/Dockerfile
   
   # Use the official Python image
   FROM python:3.11-slim
   
   # Set working directory
   WORKDIR /app
   
   # Install system dependencies
   RUN apt-get update && apt-get install -y \
       build-essential \
       && rm -rf /var/lib/apt/lists/*
   
   # Copy poetry files
   COPY pyproject.toml poetry.lock ./
   
   # Install poetry
   RUN pip install poetry && \
       poetry config virtualenvs.create false
   
   # Install dependencies
   RUN poetry install --no-dev
   
   # Copy application code
   COPY . .
   
   # Copy and make entrypoint script executable
   COPY entrypoint.sh /entrypoint.sh
   RUN chmod +x /entrypoint.sh
   
   # Expose port
   EXPOSE 8000
   
   # Run with entrypoint script
   ENTRYPOINT ["/entrypoint.sh"]
   ```

### Build and Deploy Backend

1. Build the Docker image:
   ```bash
   cd platform
   docker build -t gcr.io/YOUR_PROJECT_ID/grantcraft-backend .
   ```

2. Push the image to GCR:
   ```bash
   docker push gcr.io/YOUR_PROJECT_ID/grantcraft-backend
   ```

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy grantcraft-backend \
     --image gcr.io/YOUR_PROJECT_ID/grantcraft-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --update-env-vars "LOG_LEVEL=DEBUG,REWORKD_PLATFORM_HOST=0.0.0.0,REWORKD_PLATFORM_PORT=8000"
   ```

## Verify Deployment

After deploying both services:

1. Run the check-backend.js script to verify backend is running:
   ```bash
   cd test
   node check-backend.js
   ```

2. Access the frontend URL and verify you can access the UI without login

3. Check if the debug endpoints are accessible:
   ```bash
   # Using the Node.js script
   node check-backend.js
   ```

## Troubleshooting

If you continue to experience issues:

1. **Frontend Login Issues**:
   - Make sure `NEXT_PUBLIC_FF_AUTH_ENABLED=false` is set
   - Verify the frontend container is using the correct .env file

2. **Backend Not Responding**:
   - Check Cloud Run logs for the backend service
   - Verify the FastAPI application is starting properly
   - Make sure the entrypoint script is executing correctly

3. **Database Connection Issues**:
   - Check database connectivity from the backend
   - Verify the database connection string is correct
   - Make sure the database schema matches what the application expects

## Next Steps

Once you have a working deployment:

1. Fix the database schema issues
2. Re-enable authentication properly
3. Set up OAuth providers for secure authentication
4. Connect the frontend to the real backend by disabling mock mode