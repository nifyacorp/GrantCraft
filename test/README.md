# GrantCraft Test Utilities

This directory contains utilities for testing the GrantCraft services in Cloud Run or locally.

## Features

- Test frontend and backend health status
- Test database connectivity
- Verify login functionality
- Check for backend errors
- Generate detailed test reports

## Usage

### Installation

```bash
# Navigate to the test directory
cd test

# Install dependencies (none required for basic usage)
```

### Running Tests

You can run all tests or specific tests:

```bash
# Run all tests
node run-tests.js
# or
npm run test

# Test just the frontend health
node run-tests.js frontend
# or
npm run test:frontend

# Test just the backend health
node run-tests.js backend
# or
npm run test:backend

# Test database connection
node run-tests.js database
# or
npm run test:database

# Test login functionality
node run-tests.js login
# or
npm run test:login

# Check for errors
node run-tests.js errors
# or
npm run test:errors
```

### Customizing Service URLs

To test against different service instances, set the following environment variables:

```bash
# Test against local development services
export FRONTEND_URL=http://localhost:3000
export BACKEND_URL=http://localhost:8000
node run-tests.js

# Test against Cloud Run services
export FRONTEND_URL=https://grantcraft-frontend-320165158819.us-central1.run.app
export BACKEND_URL=https://grantcraft-backend-320165158819.us-central1.run.app
node run-tests.js
```

## Output

The test utilities generate the following outputs:

- **Console output**: Detailed information about the tests being run
- **Log files**: Stored in `outputs/logs/test-results.log`
- **Response files**: Stored in `outputs/responses/` with test name and timestamp
- **Test reports**: Stored in `outputs/test-report_*.json`

## API Reference

The `api-client.js` module provides the following functions:

- `makeApiRequest(options)`: Make an HTTP/HTTPS request with proper error handling
- `testServiceHealth(service)`: Test the health of a service ('frontend' or 'backend')
- `testDatabaseConnection(password)`: Test database connectivity
- `testLogin(username, password)`: Test login functionality
- `checkErrors(password)`: Check for errors in the backend
- `runAllTests()`: Run all tests and generate a report

## Security Notes

- Debug password is set to default "GrantCraft2025!Debug" in the code
- For production, update the password or implement proper authentication
- Avoid exposing debug endpoints in production environments