"""Main FastAPI application for the User Service"""
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, Depends, Query, Header, status
from fastapi.middleware.cors import CORSMiddleware
from .config import API_PREFIX, SERVICE_NAME, DEBUG
from .auth import get_current_user, get_user_from_header
from .services import UserService
from .models import (
    User,
    UserResponse,
    UsersListResponse,
    UpdateUserRequest,
    UpdateUserSettingsRequest
)

# Create FastAPI app
app = FastAPI(
    title=f"GrantCraft {SERVICE_NAME}",
    description="API for user profile management",
    version="1.0.0",
    debug=DEBUG
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, set specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create service instance
user_service = UserService()

# For internal service-to-service communication
async def get_user_id_from_header(
    x_user_id: Optional[str] = Header(None, alias="X-User-ID"),
    x_user_email: Optional[str] = Header(None, alias="X-User-Email")
) -> Dict[str, Any]:
    """
    Get user info from custom headers for internal service calls
    """
    return get_user_from_header(x_user_id, x_user_email)

# Health check
@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "ok", "service": SERVICE_NAME}

# User endpoints
@app.get(f"{API_PREFIX}/users/me", response_model=UserResponse)
async def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get the current user's profile
    """
    user_id = current_user["uid"]
    user = await user_service.get_user(user_id)
    
    if not user:
        # Create user if doesn't exist in our database yet (first login)
        user = await user_service.create_user(current_user)
    
    return {"user": user}

@app.get(f"{API_PREFIX}/users/{{user_id}}", response_model=UserResponse)
async def get_user_profile(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get a user's profile by ID
    """
    # TODO: Add authorization logic here (admin only or self)
    
    user = await user_service.get_user(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"user": user}

@app.put(f"{API_PREFIX}/users/me", response_model=UserResponse)
async def update_current_user_profile(
    update_data: UpdateUserRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update the current user's profile
    """
    user_id = current_user["uid"]
    
    # Filter out None values to avoid overwriting with nulls
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if not update_dict:
        # No valid update data provided
        user = await user_service.get_user(user_id)
        return {"user": user}
    
    updated_user = await user_service.update_user(user_id, update_dict)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"user": updated_user}

@app.put(f"{API_PREFIX}/users/me/settings", response_model=UserResponse)
async def update_user_settings(
    settings_data: UpdateUserSettingsRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update the current user's settings
    """
    user_id = current_user["uid"]
    
    # Filter out None values
    settings_dict = {k: v for k, v in settings_data.dict().items() if v is not None}
    
    if not settings_dict:
        # No valid settings data provided
        user = await user_service.get_user(user_id)
        return {"user": user}
    
    updated_user = await user_service.update_user_settings(user_id, settings_dict)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"user": updated_user}

@app.get(f"{API_PREFIX}/users", response_model=UsersListResponse)
async def list_users(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    List users with pagination
    """
    # TODO: Add authorization logic here (admin only)
    
    users = await user_service.list_users(limit, offset)
    return {"users": users}

# Service-to-service endpoints (for internal use)
@app.get(f"{API_PREFIX}/internal/users/{{user_id}}", response_model=UserResponse)
async def get_user_internal(
    user_id: str,
    user_info: Dict[str, Any] = Depends(get_user_id_from_header)
):
    """
    Get a user's profile for internal service-to-service communication
    """
    user = await user_service.get_user(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"user": user}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True) 