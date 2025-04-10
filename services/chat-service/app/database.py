from google.cloud import firestore
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
import os
from .config import settings

# Initialize Firestore client
db = firestore.Client(project=settings.GCP_PROJECT_ID) if settings.GCP_PROJECT_ID else firestore.Client()

class FirestoreClient:
    """
    Firestore client for database operations
    """
    
    def __init__(self):
        """Initialize the Firestore client"""
        self.db = db
        self.chats_collection = settings.FIRESTORE_COLLECTION_CHATS
        self.messages_collection = settings.FIRESTORE_COLLECTION_MESSAGES
    
    async def get_chat(self, chat_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a chat by ID
        
        Args:
            chat_id: The chat ID
            
        Returns:
            The chat document or None if not found
        """
        chat_ref = self.db.collection(self.chats_collection).document(chat_id)
        chat_doc = chat_ref.get()
        
        if chat_doc.exists:
            chat_data = chat_doc.to_dict()
            chat_data["id"] = chat_id
            return chat_data
        
        return None
    
    async def list_chats(self, project_id: str) -> List[Dict[str, Any]]:
        """
        List chats for a project
        
        Args:
            project_id: The project ID
            
        Returns:
            List of chat documents
        """
        chats_ref = self.db.collection(self.chats_collection).where("projectId", "==", project_id)
        chats = []
        
        for chat_doc in chats_ref.stream():
            chat_data = chat_doc.to_dict()
            chat_data["id"] = chat_doc.id
            chats.append(chat_data)
        
        return chats
    
    async def create_chat(self, chat_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new chat
        
        Args:
            chat_data: The chat data
            
        Returns:
            The created chat document
        """
        # Add timestamps
        now = datetime.utcnow()
        chat_data["createdAt"] = now
        chat_data["updatedAt"] = now
        
        # Create the chat document
        chat_ref = self.db.collection(self.chats_collection).document()
        chat_ref.set(chat_data)
        
        # Return the created chat
        result = chat_data.copy()
        result["id"] = chat_ref.id
        
        return result
    
    async def update_chat(self, chat_id: str, chat_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a chat
        
        Args:
            chat_id: The chat ID
            chat_data: The updated chat data
            
        Returns:
            The updated chat document or None if not found
        """
        chat_ref = self.db.collection(self.chats_collection).document(chat_id)
        chat_doc = chat_ref.get()
        
        if not chat_doc.exists:
            return None
        
        # Add updated timestamp
        chat_data["updatedAt"] = datetime.utcnow()
        
        # Update the chat document
        chat_ref.update(chat_data)
        
        # Get the updated chat
        updated_chat = chat_ref.get().to_dict()
        updated_chat["id"] = chat_id
        
        return updated_chat
    
    async def delete_chat(self, chat_id: str) -> bool:
        """
        Delete a chat
        
        Args:
            chat_id: The chat ID
            
        Returns:
            True if deleted, False if not found
        """
        chat_ref = self.db.collection(self.chats_collection).document(chat_id)
        chat_doc = chat_ref.get()
        
        if not chat_doc.exists:
            return False
        
        # Get all messages in the chat
        messages_ref = self.db.collection(self.messages_collection).where("chatId", "==", chat_id)
        
        # Delete messages batch
        batch = self.db.batch()
        for message_doc in messages_ref.stream():
            batch.delete(message_doc.reference)
        
        # Delete the chat
        batch.delete(chat_ref)
        
        # Commit the batch
        batch.commit()
        
        return True
    
    async def get_message(self, message_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a message by ID
        
        Args:
            message_id: The message ID
            
        Returns:
            The message document or None if not found
        """
        message_ref = self.db.collection(self.messages_collection).document(message_id)
        message_doc = message_ref.get()
        
        if message_doc.exists:
            message_data = message_doc.to_dict()
            message_data["id"] = message_id
            return message_data
        
        return None
    
    async def list_messages(self, chat_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """
        List messages for a chat
        
        Args:
            chat_id: The chat ID
            limit: Maximum number of messages to return
            offset: Number of messages to skip
            
        Returns:
            List of message documents
        """
        messages_ref = (
            self.db.collection(self.messages_collection)
            .where("chatId", "==", chat_id)
            .order_by("timestamp", direction=firestore.Query.DESCENDING)
            .limit(limit)
        )
        
        # Handle offset by fetching all and slicing (not ideal for large datasets)
        # In a production system, we'd use cursor pagination
        messages = []
        
        for message_doc in messages_ref.stream():
            message_data = message_doc.to_dict()
            message_data["id"] = message_doc.id
            messages.append(message_data)
        
        # Apply offset in memory (not ideal for large offsets)
        if offset > 0:
            messages = messages[offset:] if offset < len(messages) else []
        
        return messages
    
    async def create_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new message
        
        Args:
            message_data: The message data
            
        Returns:
            The created message document
        """
        # Add timestamp
        if "timestamp" not in message_data:
            message_data["timestamp"] = datetime.utcnow()
        
        # Create the message document
        message_ref = self.db.collection(self.messages_collection).document()
        message_ref.set(message_data)
        
        # Update the chat's updatedAt timestamp
        if "chatId" in message_data:
            chat_ref = self.db.collection(self.chats_collection).document(message_data["chatId"])
            chat_ref.update({"updatedAt": datetime.utcnow()})
        
        # Return the created message
        result = message_data.copy()
        result["id"] = message_ref.id
        
        return result
    
    async def update_message(self, message_id: str, message_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a message
        
        Args:
            message_id: The message ID
            message_data: The updated message data
            
        Returns:
            The updated message document or None if not found
        """
        message_ref = self.db.collection(self.messages_collection).document(message_id)
        message_doc = message_ref.get()
        
        if not message_doc.exists:
            return None
        
        # Update the message document
        message_ref.update(message_data)
        
        # Get the updated message
        updated_message = message_ref.get().to_dict()
        updated_message["id"] = message_id
        
        return updated_message
    
    async def delete_message(self, message_id: str) -> bool:
        """
        Delete a message
        
        Args:
            message_id: The message ID
            
        Returns:
            True if deleted, False if not found
        """
        message_ref = self.db.collection(self.messages_collection).document(message_id)
        message_doc = message_ref.get()
        
        if not message_doc.exists:
            return False
        
        # Delete the message
        message_ref.delete()
        
        return True 