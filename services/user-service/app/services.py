"""Business logic for the User Service"""
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from fastapi import HTTPException, status
from .database import FirestoreClient
from .models import UserDB, User, UserSettings, UserSettingsDB

class UserService:
    """
    User Service with business logic for user operations
    """
    
    def __init__(self):
        """Initialize the User Service"""
        self.db_client = FirestoreClient()
    
    async def get_user(self, user_id: str) -> Optional[User]:
        """
        Get a user by ID
        
        Args:
            user_id: The user ID
            
        Returns:
            User object or None if not found
        """
        # Get user from database
        user_db = await self.db_client.get_user(user_id)
        
        if not user_db:
            return None
        
        # Convert to API model
        return self._convert_user_db_to_model(user_db)
    
    async def create_user(self, user_data: Dict[str, Any]) -> User:
        """
        Create a new user
        
        Args:
            user_data: User data from Firebase Auth
            
        Returns:
            Created User object
        """
        # Check if user already exists
        existing_user = await self.db_client.get_user(user_data['uid'])
        if existing_user:
            # Update last login and return existing user
            updated_user = await self.db_client.update_user(user_data['uid'], {
                'lastLogin': datetime.utcnow()
            })
            return self._convert_user_db_to_model(updated_user)
        
        # Prepare user data for database
        user_db_data = {
            'id': user_data['uid'],
            'email': user_data['email'],
            'displayName': user_data.get('display_name', ''),
            'photoURL': user_data.get('photo_url', None),
            'createdAt': datetime.utcnow(),
            'lastLogin': datetime.utcnow(),
            'settings': {
                'theme': 'light',
                'notifications': True
            }
        }
        
        # Create user in database
        created_user_db = await self.db_client.create_user(user_db_data)
        
        # Convert to API model
        return self._convert_user_db_to_model(created_user_db)
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Optional[User]:
        """
        Update a user
        
        Args:
            user_id: The user ID
            update_data: User data to update
            
        Returns:
            Updated User object or None if not found
        """
        # Update user in database
        updated_user_db = await self.db_client.update_user(user_id, update_data)
        
        if not updated_user_db:
            return None
        
        # Convert to API model
        return self._convert_user_db_to_model(updated_user_db)
    
    async def delete_user(self, user_id: str) -> bool:
        """
        Delete a user
        
        Args:
            user_id: The user ID
            
        Returns:
            True if deleted, False if not found
        """
        # Delete user from database
        return await self.db_client.delete_user(user_id)
    
    async def list_users(self, limit: int = 50, offset: int = 0) -> List[User]:
        """
        List users with pagination
        
        Args:
            limit: Maximum number of users to return
            offset: Number of users to skip
            
        Returns:
            List of User objects
        """
        # Get users from database
        users_db = await self.db_client.list_users(limit, offset)
        
        # Convert to API models
        return [self._convert_user_db_to_model(user_db) for user_db in users_db]
    
    async def update_user_settings(self, user_id: str, settings_data: Dict[str, Any]) -> Optional[User]:
        """
        Update user settings
        
        Args:
            user_id: The user ID
            settings_data: Settings data to update
            
        Returns:
            Updated User object or None if not found
        """
        # Update settings in database
        updated_user_db = await self.db_client.update_user_settings(user_id, settings_data)
        
        if not updated_user_db:
            return None
        
        # Convert to API model
        return self._convert_user_db_to_model(updated_user_db)
    
    def _convert_user_db_to_model(self, user_db: UserDB) -> User:
        """
        Convert a UserDB object to a User API model
        
        Args:
            user_db: UserDB object from the database
            
        Returns:
            User API model
        """
        # Convert settings
        settings = UserSettings(
            theme=user_db.settings.theme,
            notifications=user_db.settings.notifications
        )
        
        # Convert user
        return User(
            id=user_db.id,
            email=user_db.email,
            displayName=user_db.displayName,
            photoURL=user_db.photoURL,
            createdAt=user_db.createdAt.isoformat(),
            lastLogin=user_db.lastLogin.isoformat(),
            settings=settings
        ) 