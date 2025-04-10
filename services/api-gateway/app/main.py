from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, Any, List, Optional
import httpx
import os
from .auth import verify_token, get_current_user

# Configuration
API_PREFIX = os.getenv("API_PREFIX", "/api")
BACKEND_CORS_ORIGINS = os.getenv(
    "BACKEND_CORS_ORIGINS", 
    "http://localhost:3000,http://localhost:8080"
).split(",")

# Service endpoints
# These would normally be retrieved from a configuration file or service discovery
SERVICE_ENDPOINTS = {
    "user-service": os.getenv("USER_SERVICE_URL", "http://user-service:8000"),
    "project-service": os.getenv("PROJECT_SERVICE_URL", "http://project-service:8000"),
    "chat-service": os.getenv("CHAT_SERVICE_URL", "http://chat-service:8000"),
    "file-service": os.getenv("FILE_SERVICE_URL", "http://file-service:8000"),
    "task-service": os.getenv("TASK_SERVICE_URL", "http://task-service:8000"),
    "agent-service": os.getenv("AGENT_SERVICE_URL", "http://agent-service:8000"),
}

# URL Path to Service Mapping
PATH_TO_SERVICE = {
    "/users": "user-service",
    "/projects": "project-service",
    "/chats": "chat-service",
    "/files": "file-service",
    "/tasks": "task-service",
    "/agent": "agent-service",
}

app = FastAPI(
    title="GrantCraft API Gateway",
    description="API Gateway for the GrantCraft system",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Skip auth for OPTIONS requests and health check
        if request.method == "OPTIONS" or request.url.path == f"{API_PREFIX}/health":
            return await call_next(request)
        
        # Check for authentication token
        try:
            # Extract the token from the Authorization header
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing or invalid token")
            
            token = auth_header.split("Bearer ")[1]
            # Verify the token (this would call Firebase Auth)
            user_data = await verify_token(token)
            # Add user data to request state for downstream handlers
            request.state.user = user_data
            
            return await call_next(request)
        except HTTPException as e:
            # Re-raise authentication errors
            raise e
        except Exception as e:
            # Log the error and return a 500 error
            print(f"Authentication error: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

# Add authentication middleware
app.add_middleware(AuthMiddleware)

@app.get(f"{API_PREFIX}/health")
async def health_check():
    """
    Health check endpoint for the API Gateway
    """
    return {"status": "ok", "service": "api-gateway"}

@app.api_route(f"{API_PREFIX}{{path:path}}", methods=["GET", "POST", "PUT", "DELETE"])
async def api_gateway(path: str, request_data: Dict[str, Any] = None):
    """
    Main API Gateway endpoint that routes requests to the appropriate service
    """
    # Determine which service to route to
    service = None
    for path_prefix, service_name in PATH_TO_SERVICE.items():
        if path.startswith(path_prefix):
            service = service_name
            break
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get service URL
    service_url = SERVICE_ENDPOINTS.get(service)
    if not service_url:
        raise HTTPException(status_code=503, detail=f"Service {service} is not available")
    
    # Forward the request
    target_url = f"{service_url}{path}"
    
    # Get user data from request state
    user_data = request.state.user if hasattr(request.state, "user") else None
    
    # Prepare headers
    headers = {k: v for k, v in request.headers.items() if k.lower() != "host"}
    if user_data:
        # Add user information to headers for service
        headers["X-User-ID"] = user_data.get("uid", "")
        headers["X-User-Email"] = user_data.get("email", "")
    
    try:
        async with httpx.AsyncClient() as client:
            # Send request to the appropriate service
            if request.method == "GET":
                response = await client.get(
                    target_url, 
                    headers=headers,
                    params=request.query_params
                )
            elif request.method == "POST":
                response = await client.post(
                    target_url, 
                    headers=headers,
                    json=request_data
                )
            elif request.method == "PUT":
                response = await client.put(
                    target_url, 
                    headers=headers,
                    json=request_data
                )
            elif request.method == "DELETE":
                response = await client.delete(
                    target_url, 
                    headers=headers
                )
            else:
                raise HTTPException(status_code=405, detail="Method not allowed")
            
            # Return the service's response
            return response.json()
    except httpx.RequestError as e:
        print(f"Error forwarding request: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service {service} is not available")
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 