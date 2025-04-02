# GrantCraft Login Guide

## What You're Seeing

You're seeing the default login screen for GrantCraft, which currently shows "Reworkd Enter Username" with an insecure login option. This appears because:

1. The application is configured to require authentication
2. No OAuth providers (Google, GitHub, etc.) are configured 
3. The system falls back to a development-only username login

## How to Sign In

You can sign in with any username since this is a development login method. Just:

1. Enter any username (e.g., "admin", "test@example.com", etc.)
2. Click "Sign in with username (Insecure)"

This will create a local user account with that username and log you in.

## Disabling Authentication (For Development)

If you want to bypass authentication entirely during development, you can:

1. Create or edit the `.env` file in the `/next` directory
2. Add or modify this line: `NEXT_PUBLIC_FF_AUTH_ENABLED=false`
3. Restart the application

## Configuring OAuth (For Production)

For production use, you should configure proper OAuth providers:

### Google OAuth Setup:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set up the OAuth consent screen if prompted
6. For Application Type, choose "Web application"
7. Add authorized redirect URIs: `https://your-domain.com/api/auth/callback/google`
8. Save and note your Client ID and Client Secret
9. Update your `.env` file with:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

### GitHub OAuth Setup:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details
4. Set Homepage URL to your domain
5. Set Authorization callback URL to: `https://your-domain.com/api/auth/callback/github`
6. Register the application
7. Note your Client ID and generate a Client Secret
8. Update your `.env` file with:
   ```
   GITHUB_ID=your_client_id
   GITHUB_SECRET=your_client_secret
   ```

## Modifying the Auth Configuration

To enable these providers, you'll need to modify the auth configuration:

1. Edit `/next/src/server/auth/auth.ts`
2. Add the OAuth providers you've configured

Here's an example configuration:

```typescript
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

// Inside the auth options...
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  }),
  GitHubProvider({
    clientId: process.env.GITHUB_ID || "",
    clientSecret: process.env.GITHUB_SECRET || "",
  }),
  // Keep the credentials provider for development
  Credentials({
    // ... existing configuration
  }),
],
```

## Security Notes

The "Sign in with username" method is intended for development only and should not be used in production. It's insecure because:

1. It has no password protection
2. It allows anyone to create an account
3. It doesn't verify email addresses

For production use, configure OAuth providers and consider disabling the credentials provider.