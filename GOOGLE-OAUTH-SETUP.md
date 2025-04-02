# Google OAuth Authentication Setup for GrantCraft

This guide provides step-by-step instructions to configure Google OAuth authentication for GrantCraft, enabling secure user login without using mock mode or insecure development options.

## Important Notice

**NEVER USE MOCK MODE OR MOCK DATA FOR THIS APPLICATION**

The application should always use actual authentication and real data connections. Mock modes compromise security and provide unreliable functionality.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID for future reference

## Step 2: Enable the Google OAuth APIs

1. Go to "APIs & Services" > "Library"
2. Search for "Google OAuth2 API" and enable it
3. Also enable "People API" if you want to access user profile information

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have Google Workspace)
3. Fill in the application details:
   - App name: "GrantCraft"
   - User support email: Your email address
   - Developer contact information: Your email address
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (your email and other developers)
6. Click "Save and Continue" to complete each section

## Step 4: Create OAuth Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" for the Application type
4. Name: "GrantCraft Web Client"
5. Add Authorized JavaScript origins:
   - `https://grantcraft-frontend-320165158819.us-central1.run.app`
   - Add your local development URL if needed (e.g., `http://localhost:3000`)
6. Add Authorized redirect URIs:
   - `https://grantcraft-frontend-320165158819.us-central1.run.app/api/auth/callback/google`
   - For local: `http://localhost:3000/api/auth/callback/google`
7. Click "Create"
8. Note your **Client ID** and **Client Secret** - you'll need these for configuration

## Step 5: Configure Environment Variables

Add these environment variables to your application:

```
# Authentication configuration
NEXT_PUBLIC_FF_AUTH_ENABLED=true
NEXT_PUBLIC_FF_MOCK_MODE_ENABLED=false

# Google OAuth credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth configuration
NEXTAUTH_URL=https://grantcraft-frontend-320165158819.us-central1.run.app
NEXTAUTH_SECRET=generate_a_secure_random_string
```

For Cloud Run deployment, update your service with these variables:

```bash
gcloud run deploy grantcraft-frontend \
  --image gcr.io/YOUR_PROJECT_ID/grantcraft-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --update-env-vars "NEXT_PUBLIC_FF_AUTH_ENABLED=true,NEXT_PUBLIC_FF_MOCK_MODE_ENABLED=false,GOOGLE_CLIENT_ID=your_client_id,GOOGLE_CLIENT_SECRET=your_client_secret,NEXTAUTH_URL=https://grantcraft-frontend-320165158819.us-central1.run.app,NEXTAUTH_SECRET=your_secure_secret"
```

## Step 6: Update Authentication Provider Configuration

You'll need to modify the auth.ts file to use Google OAuth:

1. Open `/next/src/server/auth/auth.ts`
2. Add Google as an authentication provider:

```typescript
import GoogleProvider from "next-auth/providers/google";

// Inside the authOptions object, update providers array:
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  }),
  // You can remove or comment out the Credentials provider
],
```

## Step 7: Database Schema Updates

The database needs the `superAdmin` column in the User table to support admin functionality:

1. Update the Prisma schema (in `next/prisma/schema.prisma`) to include:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  agents        Agent[]
  superAdmin    Boolean   @default(false)
  // other fields...
}
```

2. Generate and apply the migration:

```bash
cd next
npx prisma migrate dev --name add_super_admin
```

For a production database, use:

```bash
npx prisma migrate deploy
```

## Step 8: Test the Configuration

1. Deploy the updated application
2. Try logging in with your Google account
3. Verify that authentication works and users can access the application

## Troubleshooting

If you encounter authentication issues:

1. **Redirect URI Mismatch**: Ensure the Authorized redirect URI in Google Cloud Console exactly matches your application's callback URL
2. **Environment Variables**: Verify all environment variables are set correctly
3. **CORS Issues**: If you see CORS errors, check that your domain is added to Authorized JavaScript origins
4. **Database Errors**: If you see database errors about missing columns, ensure you've applied the proper migrations

## Security Considerations

1. **Client Secret**: Keep your Google Client Secret secure and never commit it to your repository
2. **Environment Variables**: Use Cloud Run's built-in secret management for sensitive values
3. **Authorized Domains**: Only add domains you control to the authorized origins and redirect URIs
4. **Scopes**: Only request the minimum OAuth scopes needed for your application