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

When using Cloud SQL Auth Proxy, use this format:

```
mysql://username:password@localhost/database_name?host=/cloudsql/PROJECT-ID:REGION:INSTANCE-NAME
```

Example:
```
mysql://reworkd_platform:Platform_DB_Pass_2025!@localhost/reworkd_platform?host=/cloudsql/grantcraft:us-central1:agentgpt-mysql
```

## Deployment with Cloud SQL

When deploying to Cloud Run with Cloud SQL:

```bash
gcloud run deploy SERVICE_NAME \
  --image IMAGE_URL \
  --add-cloudsql-instances PROJECT-ID:REGION:INSTANCE-NAME \
  --set-env-vars "DATABASE_URL=mysql://username:password@localhost/database_name?host=/cloudsql/PROJECT-ID:REGION:INSTANCE-NAME"
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

If experiencing database connection issues:

1. Verify the `DATABASE_URL` is correct
2. Ensure the database is accessible from the service (check firewalls)
3. For Cloud SQL, ensure the instance is properly connected
4. Use the testing tools in `/test/backend-db-check.js` to diagnose issues