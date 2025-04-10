"""Database operations for the User Service"""
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
from google.cloud import firestore
from .config import FIRESTORE_COLLECTION_USERS
from .models import UserDB, UserSettingsDB

class FirestoreClient:
    """
    Firestore client for user data operations
    """
    
    def __init__(self):
        """Initialize the Firestore client"""
        self.db = firestore.Client()
        self.users_collection = self.db.collection(FIRESTORE_COLLECTION_USERS)
    
    async def get_user(self, user_id: str) -> Optional[UserDB]:
        """
        Get a user by ID
        
        Args:
            user_id: The user ID
            
        Returns:
            UserDB or None if not found
        """
        doc_ref = self.users_collection.document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        user_data = doc.to_dict()
        
        # Convert Firestore timestamps to datetime
        created_at = user_data.get('createdAt')
        last_login = user_data.get('lastLogin')
        
        if isinstance(created_at, firestore.Timestamp):
            user_data['createdAt'] = created_at.datetime
        
        if isinstance(last_login, firestore.Timestamp):
            user_data['lastLogin'] = last_login.datetime
        
        # Ensure settings exists
        if 'settings' not in user_data:
            user_data['settings'] = {'theme': 'light', 'notifications': True}
        
        return UserDB(**user_data)
    
    async def create_user(self, user_data: Dict[str, Any]) -> UserDB:
        """
        Create a new user
        
        Args:
            user_data: User data to create
            
        Returns:
            Created UserDB
        """
        user_id = user_data.get('id')
        
        # Set timestamps if not provided
        if 'createdAt' not in user_data:
            user_data['createdAt'] = datetime.utcnow()
        
        if 'lastLogin' not in user_data:
            user_data['lastLogin'] = datetime.utcnow()
        
        # Ensure settings exists
        if 'settings' not in user_data:
            user_data['settings'] = {'theme': 'light', 'notifications': True}
        
        # Store the user document
        self.users_collection.document(user_id).set(user_data)
        
        return UserDB(**user_data)
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Optional[UserDB]:
        """
        Update a user
        
        Args:
            user_id: The user ID
            update_data: Data to update
            
        Returns:
            Updated UserDB or None if not found
        """
        doc_ref = self.users_collection.document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        # Update the document
        doc_ref.update(update_data)
        
        # Get the updated user
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()
        
        # Convert Firestore timestamps to datetime
        created_at = updated_data.get('createdAt')
        last_login = updated_data.get('lastLogin')
        
        if isinstance(created_at, firestore.Timestamp):
            updated_data['createdAt'] = created_at.datetime
        
        if isinstance(last_login, firestore.Timestamp):
            updated_data['lastLogin'] = last_login.datetime
        
        return UserDB(**updated_data)
    
    async def delete_user(self, user_id: str) -> bool:
        """
        Delete a user
        
        Args:
            user_id: The user ID
            
        Returns:
            True if deleted, False if not found
        """
        doc_ref = self.users_collection.document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        doc_ref.delete()
        return True
    
    async def list_users(self, limit: int = 50, offset: int = 0) -> List[UserDB]:
        """
        List users with pagination
        
        Args:
            limit: Maximum number of users to return
            offset: Number of users to skip
            
        Returns:
            List of UserDB objects
        """
        query = self.users_collection.limit(limit).offset(offset)
        docs = query.stream()
        
        users = []
        for doc in docs:
            user_data = doc.to_dict()
            
            # Convert Firestore timestamps to datetime
            created_at = user_data.get('createdAt')
            last_login = user_data.get('lastLogin')
            
            if isinstance(created_at, firestore.Timestamp):
                user_data['createdAt'] = created_at.datetime
            
            if isinstance(last_login, firestore.Timestamp):
                user_data['lastLogin'] = last_login.datetime
            
            # Ensure settings exists
            if 'settings' not in user_data:
                user_data['settings'] = {'theme': 'light', 'notifications': True}
            
            users.append(UserDB(**user_data))
        
        return users
    
    async def update_user_settings(self, user_id: str, settings_data: Dict[str, Any]) -> Optional[UserDB]:
        """
        Update user settings
        
        Args:
            user_id: The user ID
            settings_data: Settings data to update
            
        Returns:
            Updated UserDB or None if not found
        """
        doc_ref = self.users_collection.document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        # Get current data
        user_data = doc.to_dict()
        current_settings = user_data.get('settings', {'theme': 'light', 'notifications': True})
        
        # Update settings
        updated_settings = {**current_settings, **settings_data}
        
        # Update the document
        doc_ref.update({'settings': updated_settings})
        
        # Get the updated user
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()
        
        # Convert Firestore timestamps to datetime
        created_at = updated_data.get('createdAt')
        last_login = updated_data.get('lastLogin')
        
        if isinstance(created_at, firestore.Timestamp):
            updated_data['createdAt'] = created_at.datetime
        
        if isinstance(last_login, firestore.Timestamp):
            updated_data['lastLogin'] = last_login.datetime
        
        return UserDB(**updated_data) 