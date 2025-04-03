# Backend Redeployment Guide

This document outlines the steps to redeploy the backend with the correct database configuration to fix connection issues.

## Issue: Database Connection Errors

The backend was experiencing database connection errors because of conflicting database configuration variables:

```
OperationalError(2003, "Can't connect to MySQL server on '34.66.109.248'")
```

## Solution

The backend code has been updated to handle Cloud SQL connections correctly, but we need to redeploy with the proper environment variables.

## Deployment Steps

1. Build the Docker image
2. Push to the Artifact Registry
3. Deploy to Cloud Run with proper configuration

### 1. Build the Docker image

```bash
cd platform
gcloud builds submit --tag us-central1-docker.pkg.dev/grantcraft/backend/backend-service
```

### 2. Deploy to Cloud Run

```bash
gcloud run deploy grantcraft-backend \
  --image us-central1-docker.pkg.dev/grantcraft/backend/backend-service:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances grantcraft:us-central1:agentgpt-mysql \
  --set-env-vars "REWORKD_PLATFORM_HOST=0.0.0.0" \
  --set-env-vars "REWORKD_PLATFORM_PORT=8000" \
  --set-env-vars "REWORKD_PLATFORM_ENVIRONMENT=production" \
  --set-env-vars "REWORKD_PLATFORM_DATABASE_URL=mysql://reworkd_platform:Platform_DB_Pass_2025!@localhost/reworkd_platform?unix_socket=/cloudsql/grantcraft:us-central1:agentgpt-mysql" \
  --set-env-vars "REWORKD_PLATFORM_FRONTEND_URL=https://grantcraft-frontend-giqpmq4sta-uc.a.run.app"
```

### Important Notes

1. **Remove conflicting variables**: Do NOT include these variables in your deployment:
   - REWORKD_PLATFORM_DB_HOST
   - REWORKD_PLATFORM_DB_PORT
   - REWORKD_PLATFORM_DB_USER
   - REWORKD_PLATFORM_DB_PASS
   - REWORKD_PLATFORM_DB_BASE
   - REWORKD_PLATFORM_DB_CA_PATH

2. **Use --add-cloudsql-instances**: This is required to enable the Cloud SQL Auth Proxy in Cloud Run

3. **DATABASE_URL format**: Always use the unix_socket parameter with Cloud SQL:
   ```
   mysql://USERNAME:PASSWORD@localhost/DATABASE?unix_socket=/cloudsql/PROJECT:REGION:INSTANCE
   ```

## Verification Steps

After deployment, verify that the backend is working correctly:

1. Check the logs for any database connection errors
2. Test the health endpoint: `https://[backend-url]/api/debug/health`
3. Run the database verification script: `cd test && node db-check.js`

## Rolling Back

If you encounter issues after deployment, you can roll back to a previous revision:

```bash
gcloud run services rollback grantcraft-backend --region us-central1
```

## Additional Resources

For more information, see:
- [DATABASE-CONFIG.md](DATABASE-CONFIG.md) - Detailed database configuration guide
- [Cloud Run with Cloud SQL documentation](https://cloud.google.com/run/docs/configuring/connect-cloudsql)