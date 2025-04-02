# GrantCraft Test and Debug Utilities

This directory contains comprehensive tools for testing, debugging, and monitoring the GrantCraft application. These tools help you verify the health and functionality of both frontend and backend services.

## Features

- Test frontend and backend health status
- Access and analyze API documentation
- Discover available endpoints through schema analysis
- Test individual endpoints with customizable parameters
- Generate detailed test reports and logs

## Setup

```bash
# Navigate to the test directory
cd test

# Install dependencies if needed
# (No external dependencies required for basic functionality)
```

## Quick Start

```bash
# Run all tests
node run-tests.js all

# Or use npm scripts
npm run test:all
```

## Available Tests

| Command | Description | Example |
|---------|-------------|---------|
| `all` | Run all tests | `node run-tests.js all` |
| `frontend` | Test frontend health | `node run-tests.js frontend` |
| `backend` | Test backend health | `node run-tests.js backend` |
| `docs` | Verify API docs access | `node run-tests.js docs` |
| `schema` | Analyze API schema | `node run-tests.js schema` |
| `endpoint` | Test specific endpoint | `node run-tests.js endpoint /api/monitoring/health GET` |

## Backend Debugging Strategy

The test framework implements a robust debugging strategy for the backend:

1. **Health Checks**: Regular health checks to detect service availability
   ```bash
   node run-tests.js backend
   ```

2. **API Documentation Analysis**: Automated discovery of available endpoints
   ```bash
   node run-tests.js schema
   ```
   - This generates a list of all endpoints in `outputs/endpoints.json`
   - Identifies which endpoints require authentication
   - Provides summaries and descriptions for each endpoint

3. **Individual Endpoint Testing**: Test specific endpoints directly
   ```bash
   node run-tests.js endpoint /api/monitoring/health GET
   ```

4. **Comprehensive Reporting**: All tests generate detailed logs and reports
   - Response data saved to `outputs/responses/`
   - Test results logged to `outputs/logs/test-results.log`
   - Test reports generated as `outputs/test-report_*.json`

## Known Issues and Workarounds

### Timeouts
If you experience timeouts when connecting to backend services, the timeout has been increased to 30 seconds in the script. You can further increase it by modifying the `setTimeout` value in `api-client.js`.

### Authentication
Most backend endpoints require authentication via Google OAuth. When testing these endpoints:

1. Use the Google OAuth setup documented in `GOOGLE-OAUTH-SETUP.md`
2. For testing authenticated endpoints during development, use the OpenAPI UI at:
   ```
   https://grantcraft-backend-320165158819.us-central1.run.app/api/docs
   ```

## Usage Examples

### Check if both services are healthy:
```bash
node run-tests.js all
```

### Analyze the API to discover endpoints:
```bash
node run-tests.js schema
```

### Test a specific endpoint:
```bash
node run-tests.js endpoint /api/monitoring/health GET
```

### Test the API documentation:
```bash
node run-tests.js docs
```

## Continuous Monitoring

For continuous monitoring, you can set up a cron job to run these tests periodically:

```bash
# Add to crontab to run every 15 minutes
*/15 * * * * cd /path/to/GrantCraft/test && node run-tests.js backend >> /var/log/grantcraft-monitoring.log 2>&1
```

## Extending the Tests

The `api-client.js` module provides utilities for creating new test functions:

- `makeApiRequest()`: Make HTTP requests with proper error handling
- `saveResponse()`: Save response data to files
- `logTestResult()`: Log test results
- `analyzeApiSchema()`: Extract information from OpenAPI schema

When adding new tests, follow the pattern in existing test functions.