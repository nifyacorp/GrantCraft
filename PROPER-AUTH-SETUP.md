# Proper Authentication Setup for GrantCraft

After examining the codebase, I can now provide specific instructions for properly configuring Google OAuth authentication without using mock mode.

## Important Notice

**NEVER USE MOCK MODE OR MOCK DATA FOR THIS APPLICATION**

The application should always use actual authentication and real data connections for security and reliability.

## Configuration Steps

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select an existing one
3. Enable the Google OAuth2 API
4. Configure the OAuth consent screen
5. Create OAuth client credentials
   - Application type: Web application
   - Name: GrantCraft
   - Authorized JavaScript origins:
     - `https://grantcraft-frontend-320165158819.us-central1.run.app`
   - Authorized redirect URIs:
     - `https://grantcraft-frontend-320165158819.us-central1.run.app/api/auth/callback/google`
6. Note your Client ID and Client Secret

### 2. Update Environment Variables

Create or update the `.env` file in the `next` directory with these values:

```
# Authentication configuration - NEVER ENABLE MOCK MODE
NEXT_PUBLIC_FF_MOCK_MODE_ENABLED=false

# Google OAuth credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Database
DATABASE_URL=mysql://reworkd_platform:reworkd_platform@agentgpt_db:3307/reworkd_platform

# Next Auth
NEXTAUTH_SECRET=generate_a_secure_random_string
NEXTAUTH_URL=https://grantcraft-frontend-320165158819.us-central1.run.app

# Backend
NEXT_PUBLIC_BACKEND_URL=https://grantcraft-backend-320165158819.us-central1.run.app

# Environment
NODE_ENV=production
NEXT_PUBLIC_VERCEL_ENV=production
```

For Cloud Run deployment, update your service with these variables:

```bash
gcloud run deploy grantcraft-frontend \
  --image gcr.io/YOUR_PROJECT_ID/grantcraft-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --update-env-vars "NEXT_PUBLIC_FF_MOCK_MODE_ENABLED=false,GOOGLE_CLIENT_ID=your_client_id,GOOGLE_CLIENT_SECRET=your_client_secret,NEXTAUTH_URL=https://grantcraft-frontend-320165158819.us-central1.run.app,NEXTAUTH_SECRET=your_secure_secret,NEXT_PUBLIC_BACKEND_URL=https://grantcraft-backend-320165158819.us-central1.run.app,NODE_ENV=production,NEXT_PUBLIC_VERCEL_ENV=production"
```

### 3. Fix Database Schema

The database needs the `superAdmin` column in the User table. You'll need to apply a migration to add this column:

1. Connect to your database
2. Run an ALTER TABLE command to add the column:

```sql
ALTER TABLE User 
ADD COLUMN superAdmin BOOLEAN NOT NULL DEFAULT false;
```

Or using Prisma migrations (recommended):

```bash
cd next
npx prisma db push
# OR
npx prisma migrate dev --name add_super_admin
```

### 4. Ensure Authentication is Configured Correctly

The codebase already has Google Auth properly set up. The auth configuration in `next/src/server/auth/auth.ts` already includes Google OAuth:

```typescript
// This already exists in the codebase
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: serverEnv.GOOGLE_CLIENT_ID ?? "",
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    // Other providers...
  ],
  // ...
};
```

### 5. Deploy the Changes

1. Build and deploy the frontend:
```bash
cd next
docker build -t gcr.io/YOUR_PROJECT_ID/grantcraft-frontend .
docker push gcr.io/YOUR_PROJECT_ID/grantcraft-frontend
gcloud run deploy grantcraft-frontend --image gcr.io/YOUR_PROJECT_ID/grantcraft-frontend
```

2. Ensure the backend is properly deployed:
```bash
cd platform
docker build -t gcr.io/YOUR_PROJECT_ID/grantcraft-backend .
docker push gcr.io/YOUR_PROJECT_ID/grantcraft-backend
gcloud run deploy grantcraft-backend --image gcr.io/YOUR_PROJECT_ID/grantcraft-backend
```

### 6. Test Authentication Flow

1. Visit your application URL
2. You should see a login page with Google as an option
3. Click "Sign in with Google"
4. Complete the Google authentication flow
5. You should be redirected back to your application, now authenticated

## Troubleshooting

If you encounter issues with authentication:

### Database Errors

If you see this error:
```
Invalid `prisma.user.findUnique()` invocation: The column `reworkd_platform.User.superAdmin` does not exist in the current database.
```

This means you need to update your database schema. Follow the steps in section 3 above.

### OAuth Configuration Issues

Check the following:

1. Ensure the Client ID and Secret are correctly set in your environment variables
2. Verify that the Authorized Redirect URI in Google Cloud Console matches exactly:
   - `https://grantcraft-frontend-320165158819.us-central1.run.app/api/auth/callback/google`
3. Check that your domain is properly configured in the Authorized JavaScript origins

### NextAuth Configuration

If authentication still doesn't work:

1. Set `NODE_ENV=development` temporarily to see detailed error messages
2. Check Cloud Run logs for any authentication-related errors
3. Verify that the `NEXTAUTH_URL` matches your actual application URL

## Security Best Practices

1. Use secret management for sensitive values:
```bash
gcloud secrets create google-client-secret --replication-policy automatic
echo -n "your_client_secret" | gcloud secrets versions add google-client-secret --data-file=-
gcloud run deploy grantcraft-frontend --update-secrets=GOOGLE_CLIENT_SECRET=google-client-secret:latest
```

2. Regularly rotate your OAuth client secrets and NEXTAUTH_SECRET
3. Use HTTPS for all endpoints
4. Follow the principle of least privilege for OAuth scopes

Remember: Never enable mock mode in production. Always use proper authentication and real backend connections.