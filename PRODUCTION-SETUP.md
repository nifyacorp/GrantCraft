# GrantCraft Production Setup Guide

## Important Notice

**NEVER USE MOCK MODE OR MOCK DATA FOR THIS APPLICATION**

This application should always connect to real backend services and use proper authentication methods. Mock modes compromise security and provide unreliable functionality.

## Proper Production Configuration

### 1. Authentication Setup

As requested, configure Google OAuth following these steps:

1. **Create Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Create OAuth client ID credentials for a web application
   - Set authorized origins and redirect URIs for your domain
   - Save your Client ID and Client Secret

2. **Configure Environment Variables**:
   - Use the provided `.env.google-auth` file as a template
   - Replace placeholder values with your actual credentials
   - Ensure `NEXT_PUBLIC_FF_MOCK_MODE_ENABLED=false` to disable mock mode
   - Set proper database connection string
   - Generate a secure random string for `NEXTAUTH_SECRET`

### 2. Database Setup

1. **Update Database Schema**:
   ```bash
   cd next
   npx prisma db push
   ```

2. **Verify Schema**:
   ```bash
   npx prisma studio
   ```
   - Ensure the User table has the `superAdmin` column

### 3. Backend Configuration

1. **Deploy the Backend**:
   ```bash
   cd platform
   docker build -t gcr.io/YOUR_PROJECT_ID/grantcraft-backend .
   docker push gcr.io/YOUR_PROJECT_ID/grantcraft-backend
   
   gcloud run deploy grantcraft-backend \
     --image gcr.io/YOUR_PROJECT_ID/grantcraft-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

2. **Set Backend Environment Variables**:
   - Configure database connection
   - Set appropriate logging level
   - Enable any required API integrations

### 4. Frontend Deployment

1. **Deploy with Google Auth**:
   ```bash
   cd next
   docker build -t gcr.io/YOUR_PROJECT_ID/grantcraft-frontend .
   docker push gcr.io/YOUR_PROJECT_ID/grantcraft-frontend
   
   gcloud run deploy grantcraft-frontend \
     --image gcr.io/YOUR_PROJECT_ID/grantcraft-frontend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --update-env-vars "NEXT_PUBLIC_FF_MOCK_MODE_ENABLED=false,GOOGLE_CLIENT_ID=your_client_id,GOOGLE_CLIENT_SECRET=your_client_secret,NEXTAUTH_URL=https://your-domain.com,NEXTAUTH_SECRET=your_secret,NEXT_PUBLIC_BACKEND_URL=https://your-backend.com"
   ```

### 5. Securing Sensitive Values

For production, use secret management:

```bash
# Create and store secrets
gcloud secrets create google-client-secret --replication-policy automatic
echo -n "your_client_secret" | gcloud secrets versions add google-client-secret --data-file=-

# Use secrets in deployment
gcloud run deploy grantcraft-frontend \
  --update-secrets=GOOGLE_CLIENT_SECRET=google-client-secret:latest
```

## Production Checklist

Before going live, ensure you have:

- [ ] Configured Google OAuth with proper credentials
- [ ] Verified the database schema is correct
- [ ] Disabled all mock modes and development settings
- [ ] Tested the authentication flow end-to-end
- [ ] Secured all sensitive configuration values
- [ ] Configured proper backups for the database
- [ ] Set up monitoring and logging
- [ ] Tested the application with real data

## Monitoring and Maintenance

1. **Regularly check Cloud Run logs** for any authentication issues
2. **Monitor database performance** and scale as needed
3. **Keep OAuth credentials secure** and rotate them periodically
4. **Update dependencies** to address security vulnerabilities
5. **Backup your database** regularly

## Troubleshooting Production Issues

If you encounter issues in production:

1. **Authentication Failures**:
   - Check Cloud Run logs for error messages
   - Verify OAuth configuration in Google Cloud Console
   - Ensure environment variables are set correctly

2. **Database Connection Issues**:
   - Verify the database is accessible from Cloud Run
   - Check connection string formatting
   - Ensure proper IAM permissions

3. **API Connectivity Problems**:
   - Verify the backend service is running
   - Check network configuration between services
   - Test API endpoints directly using the test scripts

Remember: A secure, reliable application never uses mock mode or fake data in production. Always configure proper authentication and real backend connections.