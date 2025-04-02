# Debug Endpoint Implementation Plan

## Overview

This implementation plan outlines the steps to create a remote debug endpoint for the GrantCraft application. This endpoint will provide real-time diagnostics, error logs, and system status to help with remote troubleshooting.

## Goals

1. Create a secure debug endpoint that provides system status information
2. Implement error logging aggregation
3. Enable remote diagnosis of common issues
4. Provide easy access to logs without compromising security

## Implementation Phases

### Phase 1: Basic Health Endpoint

#### 1.1 Backend Health Endpoint

Create a simple health endpoint in the FastAPI backend:

```python
# platform/reworkd_platform/web/api/monitoring/views.py

from fastapi import APIRouter, Depends, Request
from reworkd_platform.services.security import verify_admin
import logging
import os
from datetime import datetime
import platform
import psutil

router = APIRouter(prefix="/debug", tags=["monitoring"])

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": os.environ.get("VERSION", "development")
    }

@router.get("/system", dependencies=[Depends(verify_admin)])
async def system_info():
    """System information (secured with admin access)"""
    return {
        "system": platform.system(),
        "release": platform.release(),
        "version": platform.version(),
        "python": platform.python_version(),
        "cpu_usage": psutil.cpu_percent(),
        "memory_usage": psutil.virtual_memory()._asdict(),
        "disk_usage": psutil.disk_usage('/')._asdict()
    }
```

Add the router to your API router:

```python
# platform/reworkd_platform/web/api/router.py

from reworkd_platform.web.api.monitoring import router as monitoring_router

# ... existing code ...
api_router.include_router(monitoring_router)
```

#### 1.2 Frontend Health Page

Create an admin-only page in the Next.js frontend to display health information:

```typescript
// next/src/pages/admin/debug.tsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/router";

interface HealthData {
  status: string;
  timestamp: string;
  version: string;
}

interface SystemData {
  system: string;
  release: string;
  version: string;
  python: string;
  cpu_usage: number;
  memory_usage: {
    total: number;
    available: number;
    percent: number;
  };
  disk_usage: {
    total: number;
    used: number;
    free: number;
    percent: number;
  };
}

const DebugPage = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { session, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is not an admin
    if (status === "unauthenticated" || !session?.user?.superAdmin) {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        
        const healthResponse = await axios.get(`${backendUrl}/api/debug/health`);
        setHealthData(healthResponse.data);
        
        // Only try to fetch system data if user is authenticated
        if (session?.user?.superAdmin) {
          try {
            const systemResponse = await axios.get(`${backendUrl}/api/debug/system`, {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            });
            setSystemData(systemResponse.data);
          } catch (systemError) {
            console.error("Could not fetch system data:", systemError);
          }
        }
      } catch (err) {
        setError("Failed to fetch debug information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.superAdmin) {
      fetchData();
      // Refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [status, session]);

  if (status === "loading" || loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!session?.user?.superAdmin) {
    return <div className="container mx-auto p-4">Unauthorized</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">System Debug</h1>
      
      <div className="mb-6 bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Health Status</h2>
        {healthData && (
          <div>
            <p>Status: <span className={`font-bold ${healthData.status === "ok" ? "text-green-500" : "text-red-500"}`}>{healthData.status}</span></p>
            <p>Timestamp: {new Date(healthData.timestamp).toLocaleString()}</p>
            <p>Version: {healthData.version}</p>
          </div>
        )}
      </div>
      
      {systemData && (
        <div className="mb-6 bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">System Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>OS:</strong> {systemData.system} {systemData.release}</p>
              <p><strong>Version:</strong> {systemData.version}</p>
              <p><strong>Python:</strong> {systemData.python}</p>
            </div>
            <div>
              <p><strong>CPU Usage:</strong> {systemData.cpu_usage}%</p>
              <p><strong>Memory Usage:</strong> {systemData.memory_usage.percent}%</p>
              <p><strong>Disk Usage:</strong> {systemData.disk_usage.percent}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPage;
```

### Phase 2: Error Logging System

#### 2.1 Backend Error Logging

Enhance the backend to capture and expose error logs:

```python
# platform/reworkd_platform/web/api/monitoring/error_log.py

import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import threading

# Create a circular buffer for storing logs
class LogEntry(BaseModel):
    timestamp: str
    level: str
    message: str
    module: str
    details: Optional[Dict[str, Any]] = None

class ErrorLogBuffer:
    def __init__(self, max_size: int = 1000):
        self.logs: List[LogEntry] = []
        self.max_size = max_size
        self.lock = threading.Lock()
    
    def add_log(self, entry: LogEntry):
        with self.lock:
            if len(self.logs) >= self.max_size:
                self.logs.pop(0)  # Remove oldest log
            self.logs.append(entry)
    
    def get_logs(self, limit: int = 100, level: Optional[str] = None):
        with self.lock:
            if level:
                filtered = [log for log in self.logs if log.level == level]
                return filtered[-limit:]
            return self.logs[-limit:]
    
    def clear(self):
        with self.lock:
            self.logs.clear()

# Create a global log buffer
log_buffer = ErrorLogBuffer()

# Create a custom log handler
class BufferLogHandler(logging.Handler):
    def emit(self, record):
        log_entry = LogEntry(
            timestamp=datetime.fromtimestamp(record.created).isoformat(),
            level=record.levelname,
            message=record.getMessage(),
            module=record.module,
            details={
                "filename": record.filename,
                "lineno": record.lineno,
                "funcName": record.funcName,
            }
        )
        log_buffer.add_log(log_entry)

# Add the handler to the root logger
def setup_error_logging():
    handler = BufferLogHandler()
    handler.setLevel(logging.ERROR)
    logging.getLogger().addHandler(handler)
```

Add this to your application startup:

```python
# platform/reworkd_platform/web/application.py

from reworkd_platform.web.api.monitoring.error_log import setup_error_logging

def create_app() -> FastAPI:
    # ... existing code ...
    
    setup_error_logging()
    
    # ... rest of function ...
```

Add an endpoint to access the logs:

```python
# platform/reworkd_platform/web/api/monitoring/views.py

from reworkd_platform.web.api.monitoring.error_log import log_buffer

@router.get("/errors", dependencies=[Depends(verify_admin)])
async def get_error_logs(limit: int = 100, level: Optional[str] = None):
    """Get recent error logs (admin only)"""
    return {
        "logs": log_buffer.get_logs(limit=limit, level=level)
    }

@router.post("/errors/clear", dependencies=[Depends(verify_admin)])
async def clear_error_logs():
    """Clear error logs (admin only)"""
    log_buffer.clear()
    return {"status": "cleared"}
```

### Phase 3: Database Status Monitoring

Add a database health check:

```python
# platform/reworkd_platform/web/api/monitoring/views.py

from sqlalchemy import text
from reworkd_platform.db.dependencies import get_db_session

@router.get("/database", dependencies=[Depends(verify_admin)])
async def database_check(session=Depends(get_db_session)):
    """Check database connectivity and status (admin only)"""
    try:
        # Simple query to check if database is responding
        result = await session.execute(text("SELECT 1"))
        database_ok = result.scalar() == 1
        
        # Get some basic stats
        version_result = await session.execute(text("SELECT VERSION()"))
        version = version_result.scalar()
        
        return {
            "status": "ok" if database_ok else "error",
            "version": version,
            "connected": database_ok
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "connected": False
        }
```

### Phase 4: Request Monitoring

Add endpoint to track recent requests:

```python
# platform/reworkd_platform/web/api/monitoring/request_tracking.py

from datetime import datetime
from typing import Dict, List, Optional
import threading
from pydantic import BaseModel
from fastapi import Request

class RequestInfo(BaseModel):
    timestamp: str
    method: str
    url: str
    client: str
    status_code: Optional[int] = None
    processing_time: Optional[float] = None
    user_id: Optional[str] = None

class RequestTracker:
    def __init__(self, max_size: int = 1000):
        self.requests: List[RequestInfo] = []
        self.max_size = max_size
        self.lock = threading.Lock()
    
    def add_request(self, request_info: RequestInfo):
        with self.lock:
            if len(self.requests) >= self.max_size:
                self.requests.pop(0)  # Remove oldest request
            self.requests.append(request_info)
    
    def get_requests(self, limit: int = 100):
        with self.lock:
            return self.requests[-limit:]
    
    def clear(self):
        with self.lock:
            self.requests.clear()

# Create a global request tracker
request_tracker = RequestTracker()

# Middleware to track requests
async def request_tracking_middleware(request: Request, call_next):
    start_time = datetime.utcnow()
    
    # Extract request info
    request_info = RequestInfo(
        timestamp=start_time.isoformat(),
        method=request.method,
        url=str(request.url),
        client=request.client.host if request.client else "unknown",
    )
    
    response = await call_next(request)
    
    # Update with response info
    end_time = datetime.utcnow()
    processing_time = (end_time - start_time).total_seconds()
    request_info.status_code = response.status_code
    request_info.processing_time = processing_time
    
    # Try to get user ID if authenticated
    try:
        if hasattr(request.state, "user") and request.state.user:
            request_info.user_id = str(request.state.user.id)
    except:
        pass
    
    request_tracker.add_request(request_info)
    
    return response
```

Register the middleware:

```python
# platform/reworkd_platform/web/application.py

from reworkd_platform.web.api.monitoring.request_tracking import request_tracking_middleware

def create_app() -> FastAPI:
    # ... existing code ...
    
    app.middleware("http")(request_tracking_middleware)
    
    # ... rest of function ...
```

Add an endpoint to access the request logs:

```python
# platform/reworkd_platform/web/api/monitoring/views.py

from reworkd_platform.web.api.monitoring.request_tracking import request_tracker

@router.get("/requests", dependencies=[Depends(verify_admin)])
async def get_recent_requests(limit: int = 100):
    """Get recent requests (admin only)"""
    return {
        "requests": request_tracker.get_requests(limit=limit)
    }
```

### Phase 5: Frontend Debug Dashboard

Enhance the frontend debug page with additional sections:

```typescript
// next/src/pages/admin/debug.tsx

// ... existing imports and code ...

// Add these new state variables
const [databaseStatus, setDatabaseStatus] = useState(null);
const [errorLogs, setErrorLogs] = useState([]);
const [recentRequests, setRecentRequests] = useState([]);
const [activeTab, setActiveTab] = useState('overview');

// Add these to your fetchData function
const databaseResponse = await axios.get(`${backendUrl}/api/debug/database`, {
  headers: { Authorization: `Bearer ${session.accessToken}` },
});
setDatabaseStatus(databaseResponse.data);

const errorLogsResponse = await axios.get(`${backendUrl}/api/debug/errors`, {
  headers: { Authorization: `Bearer ${session.accessToken}` },
});
setErrorLogs(errorLogsResponse.data.logs);

const requestsResponse = await axios.get(`${backendUrl}/api/debug/requests`, {
  headers: { Authorization: `Bearer ${session.accessToken}` },
});
setRecentRequests(requestsResponse.data.requests);

// Render these new components in your JSX
return (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">System Debug</h1>
    
    <div className="mb-4">
      <ul className="flex border-b">
        <li className="mr-1">
          <button 
            className={`py-2 px-4 ${activeTab === 'overview' ? 'bg-gray-100 border-l border-t border-r rounded-t' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
        </li>
        <li className="mr-1">
          <button 
            className={`py-2 px-4 ${activeTab === 'errors' ? 'bg-gray-100 border-l border-t border-r rounded-t' : ''}`}
            onClick={() => setActiveTab('errors')}
          >
            Error Logs
          </button>
        </li>
        <li className="mr-1">
          <button 
            className={`py-2 px-4 ${activeTab === 'requests' ? 'bg-gray-100 border-l border-t border-r rounded-t' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests
          </button>
        </li>
      </ul>
    </div>
    
    {activeTab === 'overview' && (
      <>
        {/* Health Data section - reuse your existing code */}
        {/* System Data section - reuse your existing code */}
        
        {databaseStatus && (
          <div className="mb-6 bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Database Status</h2>
            <p>Status: <span className={`font-bold ${databaseStatus.status === "ok" ? "text-green-500" : "text-red-500"}`}>{databaseStatus.status}</span></p>
            <p>Connected: {databaseStatus.connected ? "Yes" : "No"}</p>
            <p>Version: {databaseStatus.version}</p>
          </div>
        )}
      </>
    )}
    
    {activeTab === 'errors' && (
      <div className="mb-6 bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Error Logs</h2>
        <button 
          className="bg-red-500 text-white px-2 py-1 rounded text-sm mb-4"
          onClick={async () => {
            await axios.post(`${backendUrl}/api/debug/errors/clear`, {}, {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            });
            setErrorLogs([]);
          }}
        >
          Clear Logs
        </button>
        
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Level</th>
                <th className="text-left py-2">Module</th>
                <th className="text-left py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {errorLogs.map((log, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${log.level === 'ERROR' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="py-2">{log.module}</td>
                  <td className="py-2">{log.message}</td>
                </tr>
              ))}
              {errorLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">No error logs to display</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
    
    {activeTab === 'requests' && (
      <div className="mb-6 bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Recent Requests</h2>
        
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Method</th>
                <th className="text-left py-2">URL</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Time (ms)</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((req, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{new Date(req.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      req.method === 'GET' ? 'bg-blue-100 text-blue-800' : 
                      req.method === 'POST' ? 'bg-green-100 text-green-800' : 
                      req.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' : 
                      req.method === 'DELETE' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {req.method}
                    </span>
                  </td>
                  <td className="py-2 max-w-xs truncate">{req.url}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      (req.status_code >= 200 && req.status_code < 300) ? 'bg-green-100 text-green-800' :
                      (req.status_code >= 400 && req.status_code < 500) ? 'bg-yellow-100 text-yellow-800' :
                      (req.status_code >= 500) ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {req.status_code}
                    </span>
                  </td>
                  <td className="py-2">{req.processing_time ? Math.round(req.processing_time * 1000) : '-'}</td>
                </tr>
              ))}
              {recentRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">No request logs to display</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);
```

## Security Considerations

1. **Access Control**: All debug endpoints should be secured with admin-only access
2. **Sensitive Information**: Ensure no sensitive data is logged (passwords, tokens, PII)
3. **Rate Limiting**: Apply rate limiting to prevent abuse
4. **Audit Logging**: Log all access to debug endpoints

## Deployment Steps

1. Add required dependencies:
   ```bash
   # For backend
   poetry add psutil
   
   # For frontend (already included)
   # axios, react
   ```

2. Implement the backend endpoints
3. Create the frontend debug dashboard
4. Test thoroughly in development environment
5. Deploy with limited access
6. Verify functionality in production

## Benefits

1. **Faster Debugging**: Access to logs and system status without server access
2. **Better Visibility**: Real-time view of application health
3. **Reduced Downtime**: Quickly identify and diagnose issues
4. **Security**: Controlled access to debug information

## Conclusion

This debug endpoint implementation provides comprehensive system monitoring capabilities while maintaining security. It enables remote troubleshooting without direct server access and centralizes important diagnostic information in a user-friendly dashboard.

The implementation is designed to be minimally invasive to the existing codebase and can be deployed incrementally, starting with the basic health endpoint and expanding as needed.