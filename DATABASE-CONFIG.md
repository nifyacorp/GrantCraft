# GrantCraft Database Configuration

This document explains the unified database configuration approach for both the frontend and backend.

## Unified DATABASE_URL Format

Both the frontend (Next.js) and backend (FastAPI) now support a single `DATABASE_URL` environment variable for database configuration. This standardization makes deployment and configuration more consistent.

### Standard Format

```
mysql://username:password@hostname:port/database_name
```

Example:
```
mysql://reworkd_platform:Platform_DB_Pass_2025!@34.66.109.248:3306/reworkd_platform
```

### Cloud SQL Proxy Format (For Google Cloud)

When using Cloud SQL Auth Proxy, use this format with unix_socket parameter:

```
mysql://username:password@localhost/database_name?unix_socket=/cloudsql/PROJECT-ID:REGION:INSTANCE-NAME
```

Example:
```
mysql://reworkd_platform:Platform_DB_Pass_2025!@localhost/reworkd_platform?unix_socket=/cloudsql/grantcraft:us-central1:agentgpt-mysql
```

**Important**: The older format with `?host=` is deprecated and should be replaced with `?unix_socket=`

## Deployment with Cloud SQL

When deploying to Cloud Run with Cloud SQL:

```bash
gcloud run deploy SERVICE_NAME \
  --image IMAGE_URL \
  --add-cloudsql-instances PROJECT-ID:REGION:INSTANCE-NAME \
  --set-env-vars "DATABASE_URL=mysql://username:password@localhost/database_name?unix_socket=/cloudsql/PROJECT-ID:REGION:INSTANCE-NAME"
```

## Backend Changes

The backend now supports both:

1. A unified `DATABASE_URL` environment variable (recommended)
2. Individual database components for backward compatibility:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASS`
   - `DB_BASE`

If `DATABASE_URL` is provided, it takes precedence over the individual components.

## Frontend Configuration

The frontend exclusively uses the `DATABASE_URL` environment variable with Prisma.

## Security Best Practices

1. **Never** commit database credentials to the repository
2. Use environment variables or secrets management
3. Consider using Cloud SQL Auth Proxy for Google Cloud deployments
4. Restrict database access to necessary services only

## Troubleshooting

### Common Errors

#### "Can't connect to MySQL server on '34.66.109.248'"

This error occurs when:
- You're trying to connect directly to a Cloud SQL instance without using the Auth Proxy
- You have both `DATABASE_URL` and individual DB parameters (like REWORKD_PLATFORM_DB_HOST) configured

**Solution**: Remove all individual DB parameters and only use `DATABASE_URL` with the unix_socket format.

#### "Can't connect to MySQL server on 'localhost'"

This error occurs when:
- Your Cloud SQL Auth Proxy setup is incorrect
- The Unix socket path in DATABASE_URL is wrong

**Solution**: 
1. Ensure your Cloud Run service has the Cloud SQL connector enabled
2. Verify the socket path is in the format: `/cloudsql/PROJECT:REGION:INSTANCE`
3. Check that your Cloud SQL instance name is correct

### General Troubleshooting Steps

1. Verify the `DATABASE_URL` is correct
2. Ensure the database is accessible from the service (check firewalls)
3. For Cloud SQL, ensure the instance is properly connected
4. Use the testing tools in `/test/backend-db-check.js` to diagnose issues