# CORS Issue Fix for GrantCraft

## Problem

The frontend is receiving CORS errors when trying to access the backend:

```
Access to fetch at 'https://grantcraft-backend-320165158819.us-central1.run.app/api/auth/sid/info' from origin 'https://grantcraft-frontend-320165158819.us-central1.run.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause

The backend FastAPI application was configured to only allow a single frontend URL in the CORS middleware.

## Solution Implemented

We've updated the code to support multiple frontend URLs by:

1. Adding methods to parse comma-separated frontend URLs in `settings.py`:
   ```python
   def _parse_frontend_urls(self) -> List[str]:
       """Parse a comma-separated list of frontend URLs"""
       if isinstance(self.frontend_url, str) and "," in self.frontend_url:
           return [url.strip() for url in self.frontend_url.split(",")]
       return [self.frontend_url]
   
   @property
   def all_frontend_urls(self) -> List[str]:
       """Get all frontend URLs as a list"""
       return self._parse_frontend_urls()
   ```

2. Updating the CORS middleware in `application.py` to use these URLs:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=settings.all_frontend_urls,
       allow_origin_regex=settings.allowed_origins_regex,
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

## Deployment Instructions

To deploy with the updated CORS settings, you have two options:

### Option 1: Specify Multiple Frontend URLs (Recommended)

Use a comma-separated list of allowed frontend origins:

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
  --set-env-vars "REWORKD_PLATFORM_FRONTEND_URL=https://grantcraft-frontend-320165158819.us-central1.run.app,https://grantcraft.ai,http://localhost:3000"
```

### Option 2: Use a Regex Pattern

If you have multiple domains with similar patterns:

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
  --set-env-vars "REWORKD_PLATFORM_FRONTEND_URL=http://localhost:3000" \
  --set-env-vars "REWORKD_PLATFORM_ALLOWED_ORIGINS_REGEX=^https://.*grantcraft.*\.run\.app$|^https://grantcraft\.ai$"
```

## Verification

After deploying with the updated settings:

1. Visit your frontend application
2. Open browser developer tools (F12)
3. Check the Network tab for API requests
4. Verify that requests to the backend no longer show CORS errors
5. Confirm that the response headers for backend requests include:
   ```
   Access-Control-Allow-Origin: https://grantcraft-frontend-320165158819.us-central1.run.app
   ```

## Local Development

For local development, you can use:

```
REWORKD_PLATFORM_FRONTEND_URL=http://localhost:3000,http://localhost:4000
```

in your `.env` file to allow multiple frontend origins.