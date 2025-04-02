# Database Testing Guide

I've enhanced the database testing tools to make them more robust and provide better debugging information. Here's how to use them:

## Test Script Features

The updated database test script (`test/db-test.js`) now includes:

1. **Auto-discovery of the backend URL** - tries multiple possible URLs
2. **Enhanced error handling** with detailed output
3. **Increased timeout** to accommodate slower networks
4. **Comprehensive reporting** saved to a JSON file

## Running the Tests

### Option 1: Using the Wrapper Script

The simplest way to test is with the wrapper script:

```bash
cd test
./run-db-tests.sh
```

This script will:
1. First try with the local backend URL (http://localhost:8000/api)
2. If that fails, try with the production URL (https://grantcraft-backend-320165158819.us-central1.run.app/api)
3. Save a comprehensive report to `database-report.json`

### Option 2: Manual Testing with specific URL

If you know your backend URL, you can specify it directly:

```bash
cd test
API_BASE_URL=http://your-backend-url/api node db-test.js
```

## Interpreting the Results

The test output will show:

1. **Connection Status**: Whether it could connect to the database
2. **Required Tables**: Whether all necessary tables for NextAuth exist
3. **Missing Tables**: List of any tables that don't exist but should
4. **Recommendations**: Suggested commands to fix any issues

## Comprehensive Report

The script generates a `database-report.json` file with detailed information:

- Connection information
- List of all tables
- Status of required tables
- Schema information for each table
- Specific recommendations for fixing issues

## Troubleshooting Common Issues

### 1. Backend Not Running

If you see connection errors, check:
- Is the backend service running? `cd platform && poetry run uvicorn reworkd_platform.__main__:app --reload`
- Is it accessible at the URL being tested?

### 2. Missing Tables

If tables are missing:
- Run the schema migration: `cd next && ./apply-schema.sh`
- Check for errors in the migration output

### 3. Database URL Configuration

If the connection fails:
- Check your `DATABASE_URL` environment variable 
- Verify credentials and hostname
- Ensure the MySQL server is running and accessible

## Checking the Backend Routes

You can manually verify the backend routes are registered correctly:

```bash
curl http://localhost:8000/api/monitoring/database/connection
curl http://localhost:8000/api/monitoring/database/tables
curl http://localhost:8000/api/monitoring/database/required-tables
```

If these routes return 404, then there's an issue with how the routes are registered in the FastAPI application.

## Next Steps

After running the tests:

1. Apply any recommended fixes
2. Re-run the tests to verify the fixes worked
3. Try the frontend login again

If you encounter issues not covered by these tests, please check the NextAuth.js logs in the frontend application for more specific error messages.