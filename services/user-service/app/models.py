"""Data models for the User Service"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr as PydanticEmailStr

# Use EmailStr with a fallback for installations without email-validator
try:
    from pydantic import EmailStr
except ImportError:
    # If email-validator is not installed, use str instead
    EmailStr = str

# Database models (internal representation)
class UserSettingsDB(BaseModel):
    """User settings stored in the database"""
    theme: str = "light"
    notifications: bool = True
    
class UserDB(BaseModel):
    """User data stored in the database"""
    id: str
    email: str
    displayName: str
    photoURL: Optional[str] = None
    createdAt: datetime
    lastLogin: datetime
    settings: UserSettingsDB
    
# API models (external representation)
class UserSettings(BaseModel):
    """User settings for API responses"""
    theme: str
    notifications: bool
    
class User(BaseModel):
    """User data for API responses"""
    id: str
    email: str
    displayName: str
    photoURL: Optional[str] = None
    createdAt: str  # ISO date string
    lastLogin: str  # ISO date string
    settings: UserSettings
    
# Request models
class UpdateUserRequest(BaseModel):
    """Request to update user profile"""
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
    
class UpdateUserSettingsRequest(BaseModel):
    """Request to update user settings"""
    theme: Optional[str] = None
    notifications: Optional[bool] = None
    
# Response models
class UserResponse(BaseModel):
    """User profile response"""
    user: User
    
class UsersListResponse(BaseModel):
    """Response for listing users"""
    users: List[User] 