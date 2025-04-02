# GrantCraft Login Workaround

I've implemented two solutions to fix the login issues:

## 1. Database Schema Fix for OAuth Login

If you're getting the error "The table `Account` does not exist in the current database", you need to update your database schema. The NextAuth.js OAuth providers require additional tables that weren't included in the original schema.

### Fix Steps

1. The updated Prisma schema now includes all required tables (`Account`, `Session`, etc.)
2. Run the database update script:

```bash
cd next
./apply-schema.sh
```

See the full details in [DATABASE-SETUP.md](DATABASE-SETUP.md).

## 2. Login Bypass Workaround

For quick access without authentication, I've also implemented a special backdoor in the login page that bypasses authentication entirely when using the username "ratonxi".

### What Changed

I modified the `InsecureSignin` component in `next/src/pages/signin.tsx`:

```javascript
// Special bypass for "ratonxi" username - directly redirect to main page
if (usernameValue.toLowerCase() === "ratonxi") {
  // Navigate to main page - bypassing authentication
  router.push("/").catch(console.error);
  return;
}
```

### How to Use the Bypass

1. Go to the login page: https://grantcraft-frontend-320165158819.us-central1.run.app/signin
2. Enter "ratonxi" in the username field
3. Click "Sign in with username (Insecure)"
4. You'll be redirected directly to the main application

## Deploying This Change

To deploy this change:

1. Build and push a new Docker image:
   ```bash
   cd next
   docker build -t gcr.io/YOUR_PROJECT_ID/grantcraft-frontend .
   docker push gcr.io/YOUR_PROJECT_ID/grantcraft-frontend
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy grantcraft-frontend \
     --image gcr.io/YOUR_PROJECT_ID/grantcraft-frontend \
     --platform managed \
     --region us-central1
   ```

## Google OAuth Configuration

As for Google OAuth, if you want to enable it properly:

1. Use the `.env.override-with-google` file as a template.
2. Replace the placeholder values with your actual Google OAuth credentials.
3. Ensure `NEXT_PUBLIC_VERCEL_ENV=production` is set to use the production auth providers.

```bash
gcloud run deploy grantcraft-frontend \
  --image gcr.io/YOUR_PROJECT_ID/grantcraft-frontend \
  --platform managed \
  --region us-central1 \
  --update-env-vars "GOOGLE_CLIENT_ID=your_client_id,GOOGLE_CLIENT_SECRET=your_client_secret,NEXT_PUBLIC_VERCEL_ENV=production"
```

## Security Notice

This backdoor login method should only be used for development and testing purposes. It bypasses all authentication and authorization checks, which could pose a security risk if left in production code.

For a more secure approach, you should:

1. Properly configure Google OAuth for authentication
2. Or, if you need a simpler login for development, consider implementing a proper development login system with some basic security checks

When you're ready to move to production, you should remove this backdoor access mechanism.