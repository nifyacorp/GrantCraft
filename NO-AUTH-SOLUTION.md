# No Authentication Solution for GrantCraft

Since you're getting database schema errors related to authentication, the simplest solution is to disable authentication entirely for testing purposes. This document explains how to do that without modifying any schema files.

## Quick Solution: Disable Authentication

You have two options to disable authentication:

### Option 1: Set the Environment Variable Directly

Add this environment variable when running the container:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FF_AUTH_ENABLED=false \
  -e NEXT_PUBLIC_FF_MOCK_MODE_ENABLED=true \
  <your-docker-image>
```

Or update your cloud deployment:

```bash
gcloud run deploy grantcraft-frontend \
  --image <your-image> \
  --update-env-vars NEXT_PUBLIC_FF_AUTH_ENABLED=false,NEXT_PUBLIC_FF_MOCK_MODE_ENABLED=true
```

### Option 2: Override the Environment File

1. I've created a file called `.env.override` in the `next` directory
2. Deploy this file to your Cloud Run service as `.env`
3. This file has auth disabled and mock mode enabled

## Verifying the Auth is Disabled

After applying either solution:

1. Restart your application (redeploy if needed)
2. Navigate to the frontend URL
3. You should go directly to the main application screen without a login prompt
4. The application will be in "mock mode" which simulates backend functionality

## What's Happening

The application has feature flags for both auth and mock mode:

- `NEXT_PUBLIC_FF_AUTH_ENABLED=false` - Turns off authentication requirements
- `NEXT_PUBLIC_FF_MOCK_MODE_ENABLED=true` - Uses mock data instead of real backend

## Testing with Disabled Authentication

With authentication disabled, you can:

1. Access the full application interface
2. Test the UI functionality
3. Create agents and run tasks in mock mode
4. Use our test scripts to verify the backend is working

## For Production Use

When you're ready for production:

1. Fix the database schema issues (the error suggests your database is missing the `superAdmin` column)
2. Re-enable authentication by setting `NEXT_PUBLIC_FF_AUTH_ENABLED=true`
3. Set up proper OAuth providers as described in LOGIN-GUIDE.md

## Alternative Testing Methods

If you want to test the backend APIs directly (even with authentication disabled on frontend):

1. Use the test scripts in the `test` directory
2. They can verify if your backend endpoints are working properly
3. Run `cd test && ./run-tests.js all` to test all backend functions