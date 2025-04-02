# GrantCraft Testing Tools

This directory contains testing tools for the GrantCraft application. Use these tools to verify your setup and diagnose issues.

## Backend Database Check

The `backend-db-check.js` script tests the database-related endpoints on the backend API.

### Prerequisites

Make sure you have the necessary dependencies:

```bash
npm install axios
```

### Usage

Run the script:

```bash
# Test the production backend
node backend-db-check.js

# Test a custom backend URL
BACKEND_URL=http://localhost:8000 node backend-db-check.js
```

The script will:
1. Test the backend health endpoint
2. Test database connection
3. Check for required tables
4. Generate a comprehensive report
5. Save results to the `outputs` directory

### Output

The script generates:
- Console output with test results
- JSON files with detailed responses from each endpoint
- A comprehensive report at `outputs/backend-check-report.json`
- Recommendations based on the test results

### Endpoints Tested

1. **Health Check** - Basic health check that should always work
2. **Database Connection** - Checks if backend can connect to database
3. **List Tables** - Lists all tables in the database
4. **Required Tables** - Checks if all required tables exist
5. **Comprehensive Check** - Full database diagnostic with recommendations

## Fixing Database Issues

If the tests show missing tables (especially Account or Session tables needed for OAuth), follow these steps:

1. Apply the Prisma schema:
   ```bash
   cd ../next
   ./apply-schema.sh
   ```

2. Or manually run Prisma migrations:
   ```bash
   cd ../next
   npx prisma db push
   ```

3. Re-run the tests to verify the fix:
   ```bash
   cd ../test
   node backend-db-check.js
   ```

## Troubleshooting

If the tests fail with connection errors:
- Verify the backend is running
- Check if the backend URL is correct
- Verify the backend has access to the database

If the backend cannot connect to the database:
- Check the DATABASE_URL environment variable
- Verify the database server is running
- Check network connectivity between backend and database