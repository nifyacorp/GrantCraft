# Docker Troubleshooting Log

## Issues and Solutions

### Issue 1: Missing BUILD_ID file
**Error:**
```
[Error: ENOENT: no such file or directory, open '/next/.next/BUILD_ID']
```

**Solution:**
- Added `mkdir -p .next` in entrypoint.sh
- Ensured application builds correctly with proper environment variables

### Issue 2: TypeScript missing during build
**Error:**
```
It looks like you're trying to use TypeScript but do not have the required package(s) installed.
Installing dependencies
```

**Solution:**
- Added TypeScript installation in Dockerfile: `npm install --save-dev typescript`
- Pre-installed TypeScript before build step

### Issue 3: Environment variables not available during build
**Error:**
```
❌ Invalid environment variables:
 DATABASE_URL: Required
 NEXTAUTH_SECRET: Required
```

**Solution:**
- Set `SKIP_ENV_VALIDATION=true` in Dockerfile to bypass validation during build
- Pass environment variables explicitly when running the container
- Modified entrypoint.sh to ensure proper environment variable handling

### Issue 4: TypeScript error in ToolsDialog.tsx
**Error:**
```
Type error: Right operand of ?? is unreachable because the left operand is never nullish.
```

**Solution:**
- Fixed code in ToolsDialog.tsx by removing unnecessary nullish coalescing operator (??)
- Changed: `value={!sid?.connected ?? false ? false : tool.active}` to `value={!sid?.connected ? false : tool.active}`

## Environment Variables Handling

For proper environment variable handling, we:

1. Set `SKIP_ENV_VALIDATION=true` in Dockerfile to bypass validation during build
2. Pass all required environment variables when running the container
3. Ensure the entrypoint.sh script properly sets up environment variables
4. The entrypoint script exports the environment variables to ensure they're available

### Cloud Run Deployment

For Cloud Run deployments:

1. Environment variables should be set in the Cloud Run service configuration, not in the source code
2. This is done through the `--set-env-vars` flags in the `gcloud run deploy` command
3. For sensitive values, use Secret Manager and the `--update-secrets` flag
4. The `SKIP_ENV_VALIDATION=true` environment variable is essential for the build process

## Running the Container

```bash
# Build and run with all required environment variables
./next/docker-build.sh
```

## Debugging

To check logs:
```bash
docker logs -f grantcraft-next-container
```

To check environment variables inside container:
```bash
docker exec -it grantcraft-next-container env
```