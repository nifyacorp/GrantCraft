"""Configuration for the User Service"""
import os
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Service configuration
SERVICE_NAME = "user-service"
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"

# Firebase configuration
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Firestore configuration
FIRESTORE_COLLECTION_USERS = "users"

# Service endpoints for inter-service communication
SERVICE_ENDPOINTS: Dict[str, str] = {
    "project-service": os.getenv("PROJECT_SERVICE_URL", "http://localhost:8081"),
}

# Debug flag
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "t") 