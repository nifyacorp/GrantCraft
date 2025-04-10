"""Authentication utilities for the User Service"""
from typing import Dict, Any, Optional
import os
import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if already initialized
        firebase_admin.get_app()
    except ValueError:
        # Initialize with credentials
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Initialize with default credentials (for Cloud Run)
            firebase_admin.initialize_app()

# Initialize Firebase when the module is loaded
initialize_firebase()

# Bearer token extractor
security = HTTPBearer()

async def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify Firebase ID token and return user data
    
    Args:
        token: The Firebase ID token to verify
        
    Returns:
        Dict[str, Any]: User data from the verified token
        
    Raises:
        HTTPException: If token verification fails
    """
    try:
        # Verify the token
        decoded_token = auth.verify_id_token(token)
        
        # Get additional user info from Firebase
        user = auth.get_user(decoded_token['uid'])
        
        # Create a user data dictionary with the information we need
        user_data = {
            "uid": user.uid,
            "email": user.email,
            "email_verified": user.email_verified,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
            "token": decoded_token
        }
        
        return user_data
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked"
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        print(f"Error verifying token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Get current user from the Authorization header
    
    Args:
        credentials: HTTP authorization credentials
        
    Returns:
        Dict[str, Any]: User data
    """
    token = credentials.credentials
    return await verify_token(token)

def get_user_from_header(x_user_id: str = None, x_user_email: str = None) -> Dict[str, Any]:
    """
    Get user info from custom headers (for internal service-to-service calls)
    
    Args:
        x_user_id: User ID from X-User-ID header
        x_user_email: User email from X-User-Email header
        
    Returns:
        Dict[str, Any]: User data from headers
        
    Raises:
        HTTPException: If user ID header is missing
    """
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID header missing"
        )
    
    return {
        "uid": x_user_id,
        "email": x_user_email or "",
    } 