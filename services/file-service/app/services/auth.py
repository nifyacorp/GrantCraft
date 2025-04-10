from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth
import os
import json
from typing import Dict, Any

# Initialize Firebase Admin SDK
firebase_initialized = False
security = HTTPBearer()

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global firebase_initialized
    if firebase_initialized:
        return
    
    try:
        # Check if running in Google Cloud environment
        if os.getenv("GCP_PROJECT"):
            # Use default credentials in GCP
            firebase_admin.initialize_app()
        else:
            # For local development, use service account key file
            service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH", "./firebase-key.json")
            if os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
            else:
                # Try to load from environment variable for container deployment
                firebase_config = os.getenv("FIREBASE_CONFIG")
                if firebase_config:
                    # Parse the config from environment variable
                    cred_dict = json.loads(firebase_config)
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                else:
                    raise ValueError("Firebase configuration not found")
        
        firebase_initialized = True
    except Exception as e:
        print(f"Error initializing Firebase: {str(e)}")
        raise HTTPException(status_code=500, detail="Could not initialize Firebase authentication")

async def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify Firebase Auth token
    
    Args:
        token: JWT token from Firebase Auth
        
    Returns:
        Dict[str, Any]: User data from token
    """
    if not firebase_initialized:
        initialize_firebase()
    
    try:
        # Verify the token with Firebase
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed",
            headers={"WWW-Authenticate": "Bearer"},
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