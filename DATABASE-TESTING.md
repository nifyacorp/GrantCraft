# Database Testing Guide

I've enhanced the database testing capabilities to help you diagnose and fix database issues more effectively. This guide covers all the available tools and how to use them.

## Backend Database Check Endpoints

The backend includes several endpoints for checking the database:

1. **Check Connection**: `/api/monitoring/database/connection`
   - Verifies if the database is accessible
   - Returns database version info

2. **List Tables**: `/api/monitoring/database/tables`
   - Lists all tables in the database

3. **Describe Table**: `/api/monitoring/database/describe/{table_name}`
   - Shows schema details for a specific table

4. **Check Required Tables**: `/api/monitoring/database/required-tables`
   - Checks if all necessary tables for NextAuth exist
   - Identifies which tables are missing

5. **Comprehensive Check**: `/api/monitoring/database/check-all`
   - Runs all checks and returns a complete report
   - Provides recommendations for fixing issues

## Running Database Tests

### Using the Wrapper Script (Recommended)

The simplest way to run the tests is using the wrapper script:

```bash
cd test
./run-db-tests.sh
```

This script will:
1. First try with the local backend URL (http://localhost:8000/api)
2. If that fails, try with the production URL
3. Save a comprehensive report to `database-report.json`

### Using the Test Script Directly

You can also run the test script directly with a specific backend URL:

```bash
# First, make sure the backend is running
cd platform
poetry run uvicorn reworkd_platform.__main__:app --reload

# In another terminal, run the test script
cd test
npm install axios chalk  # Install dependencies if needed
API_BASE_URL=http://localhost:8000/api node db-test.js
```

The script will:
1. Test the database connection
2. Auto-detect the correct backend URL if the specified one doesn't work
3. Check for required tables
4. Generate recommendations if tables are missing
5. Save a comprehensive report to `database-report.json`

### Manual Testing via cURL

You can also test manually with cURL:

```bash
# Check connection
curl http://localhost:8000/api/monitoring/database/connection

# List tables
curl http://localhost:8000/api/monitoring/database/tables

# Check required tables
curl http://localhost:8000/api/monitoring/database/required-tables

# Get comprehensive report
curl http://localhost:8000/api/monitoring/database/check-all
```

## Fixing Database Issues

The most common issue is missing tables. If the test shows missing tables:

1. **Apply Prisma Schema**: Follow the instructions in [DATABASE-SETUP.md](DATABASE-SETUP.md)
   ```bash
   cd next
   ./apply-schema.sh
   ```

2. **Check Database URL**: Ensure your `DATABASE_URL` environment variable is correct:
   ```
   DATABASE_URL=mysql://username:password@hostname:port/database
   ```

3. **Check MySQL User Permissions**: Ensure the database user has permissions to create tables.

## Troubleshooting

If you see "Access denied" errors:
- Check your database credentials
- Ensure the user has proper permissions
- Verify the database exists

If you see "Connection refused" errors:
- Check if the database server is running 
- Verify the hostname and port are correct
- Check for any firewall issues

## Testing Production Database

To test a production database:

```bash
# Set the API base URL to point to your production backend
API_BASE_URL=https://your-production-backend.com/api node db-test.js
```

This will run the same checks against your production database.

## Next Steps

After running the tests:

1. If tables are missing: Follow the schema migration steps
2. If connection fails: Check your database configuration
3. If all tests pass but you still have issues: Check the logs for more specific errors