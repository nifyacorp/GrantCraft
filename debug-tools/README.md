# GrantCraft Debug Tools

A collection of simple tools to debug and test the GrantCraft services.

## Installation

```bash
# Install dependencies
npm install

# Make the CLI executable
chmod +x debug-cli.js

# Optional: install globally
npm link
```

## Usage

### Check Health

Check the health of both frontend and backend services:

```bash
./debug-cli.js health
```

### Test Login

Test the login functionality without actually creating a user:

```bash
./debug-cli.js login --username admin@example.com --password securepass
```

### Test Database Connectivity

Check if the backend can connect to the database:

```bash
./debug-cli.js database
```

### Get Recent Errors

Fetch recent errors from the backend:

```bash
./debug-cli.js errors
```

### Run All Checks

Run all available checks:

```bash
./debug-cli.js all
```

## Environment Variables

The following environment variables can be set to customize the behavior:

- `FRONTEND_URL`: URL of the frontend service (default: https://grantcraft-frontend-320165158819.us-central1.run.app)
- `BACKEND_URL`: URL of the backend service (default: https://grantcraft-backend-320165158819.us-central1.run.app)
- `DEBUG_PASSWORD`: Password for accessing protected debug endpoints (default: GrantCraft2025!Debug)

## Example Usage

```bash
# Set custom URLs
export FRONTEND_URL=http://localhost:3000
export BACKEND_URL=http://localhost:8000

# Run health check
./debug-cli.js health
```

## Security Notes

- The debug password should be kept secure and changed in production
- Debug endpoints should only be enabled in environments where needed
- For production security, consider implementing proper authentication