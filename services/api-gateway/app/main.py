from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, Any, List, Optional
import httpx
import os
import logging
from app.auth import verify_token, get_current_user

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("api-gateway")

# Configuration
API_PREFIX = os.getenv("API_PREFIX", "/api")
BACKEND_CORS_ORIGINS = os.getenv(
    "BACKEND_CORS_ORIGINS", 
    "http://localhost:3000,http://localhost:8080,https://grantcraft-frontend-320165158819.us-central1.run.app,https://grantcraft.ai"
).split(",")

# Log configuration on startup
logger.info(f"API_PREFIX: {API_PREFIX}")
logger.info(f"BACKEND_CORS_ORIGINS: {BACKEND_CORS_ORIGINS}")

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

# Log service endpoints on startup
for service, url in SERVICE_ENDPOINTS.items():
    logger.info(f"Service endpoint {service}: {url}")

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
            logger.info(f"Skipping auth for {request.method} {request.url.path}")
            return await call_next(request)
        
        # Check for authentication token
        try:
            # Extract the token from the Authorization header
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                logger.warning(f"Missing or invalid Authorization header for {request.url.path}")
                raise HTTPException(status_code=401, detail="Missing or invalid token")
            
            token = auth_header.split("Bearer ")[1]
            # Verify the token
            user_data = await verify_token(token)
            # Add user data to request state for downstream handlers
            request.state.user = user_data
            logger.debug(f"Authenticated user {user_data.get('uid')} for {request.url.path}")
            
            return await call_next(request)
        except HTTPException as e:
            # Re-raise authentication errors
            logger.warning(f"Authentication error for {request.url.path}: {e.detail}")
            raise e
        except Exception as e:
            # Log the error and return a 500 error
            logger.error(f"Authentication error for {request.url.path}: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

# Add authentication middleware
app.add_middleware(AuthMiddleware)

@app.get(f"{API_PREFIX}/health")
async def health_check():
    """
    Health check endpoint for the API Gateway
    """
    # Get service statuses
    service_statuses = {}
    
    try:
        for service_name, service_url in SERVICE_ENDPOINTS.items():
            try:
                # Only check health status if the service URL is set
                if service_url and not service_url.startswith("http://none"):
                    logger.info(f"Checking health of service: {service_name} at {service_url}")
                    # We use a short timeout for health checks
                    async with httpx.AsyncClient(timeout=2.0) as client:
                        health_url = f"{service_url}/api/health"
                        response = await client.get(health_url)
                        if response.status_code == 200:
                            service_statuses[service_name] = "healthy"
                        else:
                            service_statuses[service_name] = f"unhealthy ({response.status_code})"
                else:
                    service_statuses[service_name] = "not configured"
            except Exception as e:
                service_statuses[service_name] = f"error: {str(e)}"
    except Exception as e:
        logger.error(f"Error checking service health: {str(e)}")
    
    # Return health information including environment and service statuses
    return {
        "status": "ok",
        "service": "api-gateway",
        "environment": {
            "api_prefix": API_PREFIX,
            "port": os.getenv("PORT", "8080")
        },
        "services": service_statuses
    }

@app.api_route(f"{API_PREFIX}{{path:path}}", methods=["GET", "POST", "PUT", "DELETE"])
async def api_gateway(path: str, request: Request, request_data: Dict[str, Any] = None):
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
        logger.warning(f"No service mapping found for path: {path}")
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get service URL
    service_url = SERVICE_ENDPOINTS.get(service)
    if not service_url:
        logger.error(f"Service URL not configured for service: {service}")
        raise HTTPException(status_code=503, detail=f"Service {service} is not available")
    
    logger.info(f"Routing request to {service} at {service_url}{path}")
    
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
            
            # Check for error status codes
            if response.status_code >= 400:
                logger.warning(f"Error response from {service}: {response.status_code}")
                error_detail = "Service error"
                try:
                    error_data = response.json()
                    if "detail" in error_data:
                        error_detail = error_data["detail"]
                except:
                    pass
                    
                raise HTTPException(status_code=response.status_code, detail=error_detail)
                
            # Return the service's response
            return response.json()
    except httpx.RequestError as e:
        logger.error(f"Error forwarding request to {service}: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service {service} is not available")
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 