import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import json
from typing import Dict, Any

# Initialize Firebase Admin SDK
# In a production environment, the service account would be loaded from a secret
firebase_initialized = False

def initialize_firebase():
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

# Initialize Firebase when the module is loaded
initialize_firebase()

# Bearer token extractor
security = HTTPBearer()

async def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify Firebase ID token and return user data
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
        raise HTTPException(status_code=401, detail="Token has expired")
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token has been revoked")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"Error verifying token: {str(e)}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Get current user from the Authorization header
    """
    token = credentials.credentials
    return await verify_token(token) 