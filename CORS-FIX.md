# CORS Issue Fix for GrantCraft

## Problem

The frontend is receiving CORS errors when trying to access the backend:

```
Access to fetch at 'https://grantcraft-backend-320165158819.us-central1.run.app/api/auth/sid/info' from origin 'https://grantcraft-frontend-320165158819.us-central1.run.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause

In `platform/reworkd_platform/web/application.py`, the CORS middleware is configured to only allow a *single* frontend URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],  # Only allows ONE URL
    allow_origin_regex=settings.allowed_origins_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Solution Options

### Option 1: Use a comma-separated list of URLs

Deploy the backend with multiple allowed origins:

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
  --set-env-vars "REWORKD_PLATFORM_DATABASE_URL=mysql+aiomysql://reworkd_platform:Platform_DB_Pass_2025!@/reworkd_platform?unix_socket=/cloudsql/grantcraft:us-central1:agentgpt-mysql" \
  --set-env-vars "REWORKD_PLATFORM_FRONTEND_URL=https://grantcraft-frontend-320165158819.us-central1.run.app" \
  --set-env-vars "REWORKD_PLATFORM_ALLOWED_ORIGINS_REGEX=https://grantcraft-frontend-.*\\.us-central1\\.run\\.app"
```

### Option 2: Edit the code to support multiple origins

In an actual code change, modify `settings.py` and `application.py` to support multiple frontend URLs:

1. In `platform/reworkd_platform/settings.py`:
```python
# Change this line:
frontend_url: str = "http://localhost:3000"

# To this:
frontend_urls: List[str] = ["http://localhost:3000"]
```

2. Then update the environment variable parsing to split a comma-separated list:
```python
# Add this method to the Settings class
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

3. In `platform/reworkd_platform/web/application.py`:
```python
# Change this line:
allow_origins=[settings.frontend_url],

# To this:
allow_origins=settings.all_frontend_urls,
```

### Option 3: Quick Temporary Fix for Testing

To quickly test without code changes, allow all origins with:

```bash
gcloud run deploy grantcraft-backend \
  [other parameters as above] \
  --set-env-vars "REWORKD_PLATFORM_FRONTEND_URL=*"
```

This will allow requests from any origin (not recommended for production).

## Recommended Approach

For a production environment:

1. Use Option 1 with a specific regex pattern to match only your frontend domains
2. For a permanent solution, implement Option 2 to properly support multiple frontend URLs

After fixing the CORS issue, verify by checking the network tab in browser developer tools to ensure the backend requests no longer have CORS errors.