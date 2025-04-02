# Google Sign-In Fix for GrantCraft

I've identified why Google Sign-In is not appearing on your login page despite having the Google OAuth provider configured.

## The Issue

The application has Google OAuth correctly configured in `auth.ts`, but it's missing the environment variables needed for the Google sign-in to be active. The missing environment variables are:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## How Authentication Selection Works

The authentication flow works as follows:

1. In `signin.tsx`, the page calls `getProviders()` to get all configured providers
2. It then renders sign-in buttons for each provider in `details`
3. The issue is that providers where credentials aren't provided are being filtered out

## Solution

Add the Google credentials to your `.env` file or Cloud Run environment variables:

```
# Add these to your .env file
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Make sure to set the development environment
NEXT_PUBLIC_VERCEL_ENV=production
```

### Detailed Steps

1. **Update Environment Variables**:

   Add the Google OAuth credentials to your `.env` file:

   ```
   # Database connection
   DATABASE_URL=mysql://reworkd_platform:Platform_DB_Pass_2025!@34.66.109.248:3306/reworkd_platform

   # Next Auth
   NEXTAUTH_SECRET=grantcraft_next_auth_secret_2025!
   NEXTAUTH_URL=https://grantcraft-frontend-320165158819.us-central1.run.app

   # OAuth Providers
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Backend connection
   NEXT_PUBLIC_BACKEND_URL=https://grantcraft-backend-320165158819.us-central1.run.app

   # Force production mode
   NODE_ENV=production
   NEXT_PUBLIC_VERCEL_ENV=production
   ```

2. **Ensure Development Mode is Disabled**:

   The application has special logic in `auth/index.ts` that replaces the production auth providers with development ones when in development mode:

   ```javascript
   const options =
     env.NEXT_PUBLIC_VERCEL_ENV === "development"
       ? devOptions(commonOptions.adapter, req, res)
       : prodOptions;
   ```

   Make sure `NEXT_PUBLIC_VERCEL_ENV` is set to `production` to use the production providers (which include Google).

3. **Redeploy the Frontend**:

   After updating the environment variables, redeploy your frontend service:

   ```bash
   gcloud run deploy grantcraft-frontend \
     --image gcr.io/YOUR_PROJECT_ID/grantcraft-frontend \
     --update-env-vars "GOOGLE_CLIENT_ID=your_client_id,GOOGLE_CLIENT_SECRET=your_client_secret"
   ```

## Verification

After making these changes, visit the sign-in page again. You should now see the "Sign in with google" button alongside the "Sign in with username" option.

## Debugging OAuth Issues

If you make these changes and still don't see the Google sign-in option, try the following:

1. **Check Environment Variables in the Deployed Service**:

   Verify that the environment variables are correctly set in your Cloud Run service:

   ```bash
   gcloud run services describe grantcraft-frontend \
     --format="value(spec.template.spec.containers[0].env)" \
     --region=us-central1
   ```

2. **Examine Frontend Logs**:

   Look for any errors related to provider initialization:

   ```bash
   gcloud run services logs read grantcraft-frontend --region=us-central1
   ```

3. **Manual Test in Browser**:

   Check the network requests and console logs when loading the sign-in page to identify any errors.

## Note About Credentials Provider

The insecure username login ("Sign in with username (Insecure)") appears because the application automatically includes the credentials provider in development mode. In production with proper OAuth providers configured, you might want to remove this option for security reasons.

To do this, you would need to modify the `auth/index.ts` file to not include the credentials provider in any environment.