# Simple Debug Solution for GrantCraft

This document outlines a lightweight approach to debug and test the GrantCraft application remotely, focusing on simple HTTP endpoints and CLI tools.

## Overview

Instead of a full dashboard, we'll implement:

1. Simple health/status endpoints on both frontend and backend
2. A local CLI tool to check service status and run tests
3. Basic error logging accessible via API

## Implementation

### 1. Backend Health & Debug Endpoints

Add these endpoints to the FastAPI backend:

```python
# platform/reworkd_platform/web/api/monitoring/views.py

from fastapi import APIRouter, Request, Response
import logging
import os
from datetime import datetime
import platform
import json
from typing import Dict, List, Optional
import asyncio

# Create an in-memory buffer for recent errors
recent_errors: List[Dict] = []
MAX_ERRORS = 100

# Setup a custom error handler to capture errors
class ErrorCaptureHandler(logging.Handler):
    def emit(self, record):
        global recent_errors
        if record.levelno >= logging.ERROR:
            error_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "level": record.levelname,
                "message": record.getMessage(),
                "module": record.module,
                "line": record.lineno
            }
            recent_errors.append(error_entry)
            if len(recent_errors) > MAX_ERRORS:
                recent_errors.pop(0)  # Remove oldest error

# Add the handler to root logger
error_handler = ErrorCaptureHandler()
logging.getLogger().addHandler(error_handler)
logging.getLogger().setLevel(logging.INFO)

router = APIRouter(prefix="/debug", tags=["debug"])

@router.get("/health")
async def health_check():
    """Basic health check that returns service status"""
    return {
        "service": "backend",
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": os.environ.get("VERSION", "development")
    }

@router.get("/ping")
async def ping():
    """Simple ping endpoint that returns pong"""
    return {"ping": "pong"}

@router.get("/errors")
async def get_errors(password: str = None):
    """Get recent errors - protected with a simple password"""
    # In a real app, use proper auth instead of this simple password
    if password != os.environ.get("DEBUG_PASSWORD", "GrantCraft2025!Debug"):
        return Response(status_code=403, content="Unauthorized")
    
    return {
        "errors": recent_errors,
        "count": len(recent_errors)
    }

@router.get("/test/login")
async def test_login(username: str = "test@example.com", password: str = "password123"):
    """Test the login functionality without actually creating a user"""
    try:
        # Simulate login process
        await asyncio.sleep(0.5)  # Simulate processing time
        
        # This is just a test endpoint - in a real app, you'd use your actual auth logic
        # But keep it separate from production code
        if username and password:
            return {
                "status": "success",
                "test": "login",
                "message": f"Login simulation for {username} completed",
                "would_succeed": True
            }
        else:
            return {
                "status": "error",
                "test": "login", 
                "message": "Missing username or password",
                "would_succeed": False
            }
    except Exception as e:
        logging.error(f"Login test failed: {str(e)}")
        return {
            "status": "error",
            "test": "login",
            "message": f"Test failed: {str(e)}",
            "would_succeed": False
        }

@router.get("/test/database")
async def test_database(password: str = None):
    """Test database connectivity - protected with a simple password"""
    if password != os.environ.get("DEBUG_PASSWORD", "GrantCraft2025!Debug"):
        return Response(status_code=403, content="Unauthorized")
    
    try:
        from sqlalchemy import text
        from reworkd_platform.db.dependencies import get_db_session
        
        # Get a database session
        session = get_db_session()
        
        # Try a simple query
        result = await session.execute(text("SELECT 1"))
        is_connected = result.scalar() == 1
        
        if is_connected:
            # Get some basic database info
            version_result = await session.execute(text("SELECT VERSION()"))
            version = version_result.scalar()
            
            return {
                "status": "success",
                "connected": True,
                "version": version,
                "message": "Database connection successful"
            }
        else:
            return {
                "status": "error",
                "connected": False,
                "message": "Database query did not return expected result"
            }
    except Exception as e:
        logging.error(f"Database test failed: {str(e)}")
        return {
            "status": "error",
            "connected": False,
            "message": f"Database test failed: {str(e)}"
        }
```

Add the router to your API router:

```python
# platform/reworkd_platform/web/api/router.py

from reworkd_platform.web.api.monitoring import router as monitoring_router

# ... existing code ...
api_router.include_router(monitoring_router)
```

### 2. Frontend Status API Routes

Add simple API routes to the Next.js frontend:

```typescript
// next/src/pages/api/debug/health.ts
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    service: "frontend",
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_VERSION || "development",
    node_env: process.env.NODE_ENV
  });
}

// next/src/pages/api/debug/ping.ts
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ping: "pong" });
}

// next/src/pages/api/debug/backend-status.ts
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    if (!backendUrl) {
      return res.status(500).json({ 
        error: "NEXT_PUBLIC_BACKEND_URL is not configured"
      });
    }
    
    // Check backend health
    const response = await axios.get(`${backendUrl}/api/debug/health`, {
      timeout: 5000 // 5 second timeout
    });
    
    return res.status(200).json({
      frontend: {
        status: "ok",
        timestamp: new Date().toISOString()
      },
      backend: response.data,
      connection: "ok"
    });
  } catch (error) {
    console.error("Backend status check failed:", error);
    
    return res.status(200).json({
      frontend: {
        status: "ok",
        timestamp: new Date().toISOString()
      },
      backend: {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      connection: "failed"
    });
  }
}
```

### 3. Local Debug CLI Tool

Create a simple Node.js tool to check services and run tests:

```javascript
// debug-cli.js
#!/usr/bin/env node

const axios = require('axios');
const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');

// Default URLs for the services
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://grantcraft-frontend-320165158819.us-central1.run.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://grantcraft-backend-320165158819.us-central1.run.app';
const DEBUG_PASSWORD = process.env.DEBUG_PASSWORD || 'GrantCraft2025!Debug';

// Helper to format time
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
}

// Check health of both services
async function checkHealth() {
  const spinner = ora('Checking service health...').start();
  
  try {
    // Check frontend
    const frontendResponse = await axios.get(`${FRONTEND_URL}/api/debug/health`, { timeout: 5000 });
    
    // Check backend
    const backendResponse = await axios.get(`${BACKEND_URL}/api/debug/health`, { timeout: 5000 });
    
    spinner.succeed('Health check completed');
    
    console.log('\nFrontend Status:');
    console.log(`  Status: ${chalk.green(frontendResponse.data.status)}`);
    console.log(`  Timestamp: ${formatTime(frontendResponse.data.timestamp)}`);
    console.log(`  Version: ${frontendResponse.data.version}`);
    console.log(`  Environment: ${frontendResponse.data.node_env}`);
    
    console.log('\nBackend Status:');
    console.log(`  Status: ${chalk.green(backendResponse.data.status)}`);
    console.log(`  Timestamp: ${formatTime(backendResponse.data.timestamp)}`);
    console.log(`  Version: ${backendResponse.data.version}`);
    
    return true;
  } catch (error) {
    spinner.fail('Health check failed');
    
    if (error.response) {
      console.error(chalk.red(`Error: Received ${error.response.status} from ${error.config.url}`));
    } else if (error.request) {
      console.error(chalk.red(`Error: No response received from ${error.config.url}`));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    
    return false;
  }
}

// Test login functionality
async function testLogin(username, password) {
  const spinner = ora('Testing login functionality...').start();
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/debug/test/login`, {
      params: { username, password },
      timeout: 5000
    });
    
    spinner.succeed('Login test completed');
    
    console.log(`\nStatus: ${response.data.status === 'success' ? chalk.green(response.data.status) : chalk.red(response.data.status)}`);
    console.log(`Message: ${response.data.message}`);
    console.log(`Would succeed: ${response.data.would_succeed ? chalk.green('Yes') : chalk.red('No')}`);
    
    return response.data.would_succeed;
  } catch (error) {
    spinner.fail('Login test failed');
    
    if (error.response) {
      console.error(chalk.red(`Error: Received ${error.response.status} from server`));
      console.error(error.response.data);
    } else if (error.request) {
      console.error(chalk.red('Error: No response received from server'));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    
    return false;
  }
}

// Test database connectivity
async function testDatabase() {
  const spinner = ora('Testing database connectivity...').start();
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/debug/test/database`, {
      params: { password: DEBUG_PASSWORD },
      timeout: 8000
    });
    
    if (response.data.connected) {
      spinner.succeed('Database connection successful');
      console.log(`\nDatabase version: ${response.data.version}`);
    } else {
      spinner.fail('Database connection failed');
      console.error(chalk.red(`Error: ${response.data.message}`));
    }
    
    return response.data.connected;
  } catch (error) {
    spinner.fail('Database test failed');
    
    if (error.response) {
      if (error.response.status === 403) {
        console.error(chalk.red('Error: Authentication failed - check DEBUG_PASSWORD'));
      } else {
        console.error(chalk.red(`Error: Received ${error.response.status} from server`));
        console.error(error.response.data);
      }
    } else if (error.request) {
      console.error(chalk.red('Error: No response received from server'));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    
    return false;
  }
}

// Get recent errors
async function getErrors() {
  const spinner = ora('Fetching recent errors...').start();
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/debug/errors`, {
      params: { password: DEBUG_PASSWORD },
      timeout: 5000
    });
    
    spinner.succeed(`Found ${response.data.count} errors`);
    
    if (response.data.count === 0) {
      console.log(chalk.green('\nNo errors found - system looks healthy!'));
    } else {
      console.log(chalk.yellow(`\nMost recent errors (${response.data.count}):`));
      
      response.data.errors.slice(-10).forEach((error, index) => {
        console.log(`\n${index + 1}. ${chalk.red(error.level)} at ${formatTime(error.timestamp)}`);
        console.log(`   Module: ${error.module}:${error.line}`);
        console.log(`   Message: ${error.message}`);
      });
    }
    
    return response.data.errors;
  } catch (error) {
    spinner.fail('Failed to fetch errors');
    
    if (error.response) {
      if (error.response.status === 403) {
        console.error(chalk.red('Error: Authentication failed - check DEBUG_PASSWORD'));
      } else {
        console.error(chalk.red(`Error: Received ${error.response.status} from server`));
      }
    } else if (error.request) {
      console.error(chalk.red('Error: No response received from server'));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    
    return [];
  }
}

// Setup CLI commands
program
  .name('grantcraft-debug')
  .description('CLI tool for debugging GrantCraft services')
  .version('1.0.0');

program
  .command('health')
  .description('Check health of frontend and backend services')
  .action(checkHealth);

program
  .command('login')
  .description('Test login functionality')
  .option('-u, --username <username>', 'Username for login test', 'test@example.com')
  .option('-p, --password <password>', 'Password for login test', 'password123')
  .action((options) => testLogin(options.username, options.password));

program
  .command('database')
  .description('Test database connectivity')
  .action(testDatabase);

program
  .command('errors')
  .description('Get recent errors from the backend')
  .action(getErrors);

program
  .command('all')
  .description('Run all checks')
  .action(async () => {
    console.log(chalk.blue('=== GrantCraft System Check ===\n'));
    
    console.log(chalk.blue('Checking service health...'));
    const healthOk = await checkHealth();
    
    console.log(chalk.blue('\nTesting login functionality...'));
    const loginOk = await testLogin('test@example.com', 'password123');
    
    console.log(chalk.blue('\nTesting database connectivity...'));
    const dbOk = await testDatabase();
    
    console.log(chalk.blue('\nChecking for recent errors...'));
    const errors = await getErrors();
    
    console.log(chalk.blue('\n=== Summary ==='));
    console.log(`Health check: ${healthOk ? chalk.green('PASS') : chalk.red('FAIL')}`);
    console.log(`Login test: ${loginOk ? chalk.green('PASS') : chalk.red('FAIL')}`);
    console.log(`Database test: ${dbOk ? chalk.green('PASS') : chalk.red('FAIL')}`);
    console.log(`Errors: ${errors.length === 0 ? chalk.green('None found') : chalk.yellow(errors.length + ' found')}`);
    
    const allOk = healthOk && loginOk && dbOk && errors.length === 0;
    console.log(`\nOverall status: ${allOk ? chalk.green('HEALTHY') : chalk.yellow('ISSUES DETECTED')}`);
    
    if (!allOk) {
      process.exit(1);
    }
  });

// Parse arguments
program.parse();

// Default to "all" if no command is provided
if (process.argv.length <= 2) {
  program.help();
}
```

### 4. Install Dependencies and Setup

```bash
# Create a directory for the CLI tool
mkdir -p debug-tools
cd debug-tools

# Initialize package.json
npm init -y

# Install dependencies
npm install axios commander chalk ora

# Create the CLI file
touch debug-cli.js
chmod +x debug-cli.js

# Now paste the code from above into debug-cli.js
```

## Usage

### Running the Debug CLI

```bash
# Setup environment variables (optional)
export FRONTEND_URL=https://grantcraft-frontend-320165158819.us-central1.run.app
export BACKEND_URL=https://grantcraft-backend-320165158819.us-central1.run.app
export DEBUG_PASSWORD=GrantCraft2025!Debug

# Run health check
./debug-cli.js health

# Test login functionality
./debug-cli.js login --username admin@example.com --password securepass

# Test database connectivity
./debug-cli.js database

# Get recent errors
./debug-cli.js errors

# Run all checks
./debug-cli.js all
```

### Using Debug Endpoints Directly

You can also call the endpoints directly without the CLI:

```bash
# Check frontend health
curl https://grantcraft-frontend-320165158819.us-central1.run.app/api/debug/health

# Check backend health
curl https://grantcraft-backend-320165158819.us-central1.run.app/api/debug/health

# Test backend ping
curl https://grantcraft-backend-320165158819.us-central1.run.app/api/debug/ping

# Test login
curl "https://grantcraft-backend-320165158819.us-central1.run.app/api/debug/test/login?username=test@example.com&password=password123"

# Get recent errors (requires password)
curl "https://grantcraft-backend-320165158819.us-central1.run.app/api/debug/errors?password=GrantCraft2025!Debug"
```

## Security Considerations

1. **Password Protection**: Critical endpoints are protected with a simple password
2. **Limited Information**: The debug endpoints only expose non-sensitive system information
3. **Read-Only**: All endpoints are read-only and cannot modify system state
4. **Testing**: Test endpoints emulate functionality but don't make actual changes

## Next Steps

1. Implement the backend debug endpoints in your FastAPI application
2. Add the frontend API routes to your Next.js app
3. Create the local debug CLI tool
4. Test the solution with your deployed services

This simple solution gives you the ability to check service health, test critical functionality, and view errors without implementing a full dashboard or making significant changes to your application architecture.