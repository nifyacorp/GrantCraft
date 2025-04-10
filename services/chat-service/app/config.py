from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """
    Settings for the Chat Service
    """
    # API configuration
    API_PREFIX: str = ""
    
    # CORS configuration
    CORS_ORIGINS: List[str] = ["*"]
    
    # Firebase configuration
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_SERVICE_ACCOUNT_KEY_PATH: str = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH", "./firebase-key.json")
    
    # Google Cloud configuration
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "")
    GCP_LOCATION: str = os.getenv("GCP_LOCATION", "us-central1")
    
    # Firestore configuration
    FIRESTORE_COLLECTION_CHATS: str = "chats"
    FIRESTORE_COLLECTION_MESSAGES: str = "messages"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create settings instance
settings = Settings() 