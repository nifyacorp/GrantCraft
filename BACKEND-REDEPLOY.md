# Backend Redeployment Guide

After making changes to the database connection code, you need to rebuild and redeploy the backend. This document outlines the steps required.

## 1. Rebuild the Backend Docker Image

```bash
# Navigate to the platform directory
cd platform

# Build the Docker image
docker build -t gcr.io/grantcraft-320165158819/agentgpt-platform:latest .

# Push the image to Google Container Registry
docker push gcr.io/grantcraft-320165158819/agentgpt-platform:latest
```

## 2. Redeploy to Cloud Run with Cloud SQL

```bash
# Deploy to Cloud Run with Cloud SQL connection
gcloud run deploy grantcraft-backend \
  --image gcr.io/grantcraft-320165158819/agentgpt-platform:latest \
  --platform managed \
  --region us-central1 \
  --add-cloudsql-instances grantcraft:us-central1:agentgpt-mysql \
  --set-env-vars "DATABASE_URL=mysql://reworkd_platform:Platform_DB_Pass_2025!@localhost/reworkd_platform?host=/cloudsql/grantcraft:us-central1:agentgpt-mysql"
```

## 3. Verify the Deployment

After deployment completes, run the database check script:

```bash
cd test
node backend-db-check.js
```

## 4. Troubleshooting

If the database connection still fails:

1. **Check Logs**: Review the Cloud Run service logs for errors
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=grantcraft-backend" --limit=50
   ```

2. **Verify Environment Variables**: Check that the environment variables are set correctly
   ```bash
   gcloud run services describe grantcraft-backend --format="value(spec.template.spec.containers[0].env)"
   ```

3. **Test Database Access**: Make sure the service account has access to the Cloud SQL instance
   ```bash
   gcloud projects add-iam-policy-binding PROJECT-ID \
     --member="serviceAccount:SERVICE-ACCOUNT@PROJECT-ID.iam.gserviceaccount.com" \
     --role="roles/cloudsql.client"
   ```

4. **Check Prisma Schema**: Make sure the Prisma schema in the frontend directory includes all the required tables
   ```bash
   cd next
   npx prisma db push
   ```

## Important Notes

- The backend code now looks for the `DATABASE_URL` environment variable first, then falls back to the individual database parameters if it's not found
- The Cloud SQL instance connection name should be in the format `PROJECT-ID:REGION:INSTANCE-NAME`
- The database connection string should use the special format with the Cloud SQL Auth Proxy
- Any changes to the application code require a full rebuild and redeploy