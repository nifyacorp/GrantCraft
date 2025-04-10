from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from fastapi import HTTPException, status
from .database import FirestoreClient
from .models import Chat, Message, ChatDB, MessageDB, CreateChatRequest, CreateMessageRequest, MessageRole

class ChatService:
    """
    Chat Service with business logic for chat and message operations
    """
    
    def __init__(self):
        """Initialize the Chat Service"""
        self.db_client = FirestoreClient()
    
    async def list_chats(self, project_id: str, user_id: str) -> List[Chat]:
        """
        List all chat sessions for a project
        
        Args:
            project_id: The project ID
            user_id: The user ID
            
        Returns:
            List of chat objects
        """
        # TODO: Check if user has access to the project
        # This would ideally be part of an authorization service or middleware
        
        # Get chats from database
        chat_data_list = await self.db_client.list_chats(project_id)
        
        # Convert to API models
        chats = []
        for chat_data in chat_data_list:
            chat = self._convert_chat_data_to_model(chat_data)
            chats.append(chat)
        
        return chats
    
    async def get_chat(self, chat_id: str, user_id: str) -> Optional[Chat]:
        """
        Get a specific chat session by ID
        
        Args:
            chat_id: The chat ID
            user_id: The user ID
            
        Returns:
            Chat object or None if not found
        """
        # Get chat from database
        chat_data = await self.db_client.get_chat(chat_id)
        
        if not chat_data:
            return None
        
        # TODO: Check if user has access to the chat's project
        
        # Convert to API model
        return self._convert_chat_data_to_model(chat_data)
    
    async def create_chat(self, chat_request: CreateChatRequest, user_id: str) -> Chat:
        """
        Create a new chat session
        
        Args:
            chat_request: The chat creation request
            user_id: The user ID
            
        Returns:
            Created chat object
        """
        # TODO: Check if user has access to the project
        
        # Create chat data
        chat_data = {
            "projectId": chat_request.projectId,
            "title": chat_request.title,
        }
        
        # Create chat in database
        created_chat_data = await self.db_client.create_chat(chat_data)
        
        # Convert to API model
        return self._convert_chat_data_to_model(created_chat_data)
    
    async def delete_chat(self, chat_id: str, user_id: str) -> bool:
        """
        Delete a chat session
        
        Args:
            chat_id: The chat ID
            user_id: The user ID
            
        Returns:
            True if deleted, False if not found
        """
        # TODO: Check if user has access to the chat's project
        
        # Delete chat from database
        return await self.db_client.delete_chat(chat_id)
    
    async def list_messages(self, chat_id: str, user_id: str, limit: int = 50, offset: int = 0) -> List[Message]:
        """
        List messages for a chat session
        
        Args:
            chat_id: The chat ID
            user_id: The user ID
            limit: Maximum number of messages to return
            offset: Number of messages to skip
            
        Returns:
            List of message objects
        """
        # TODO: Check if user has access to the chat's project
        
        # Get messages from database
        message_data_list = await self.db_client.list_messages(chat_id, limit, offset)
        
        # Convert to API models
        messages = []
        for message_data in message_data_list:
            message = self._convert_message_data_to_model(message_data)
            messages.append(message)
        
        return messages
    
    async def get_message(self, message_id: str, user_id: str) -> Optional[Message]:
        """
        Get a specific message by ID
        
        Args:
            message_id: The message ID
            user_id: The user ID
            
        Returns:
            Message object or None if not found
        """
        # Get message from database
        message_data = await self.db_client.get_message(message_id)
        
        if not message_data:
            return None
        
        # TODO: Check if user has access to the message's chat project
        
        # Convert to API model
        return self._convert_message_data_to_model(message_data)
    
    async def create_message(self, message_request: CreateMessageRequest, user_id: str) -> Message:
        """
        Create a new message
        
        Args:
            message_request: The message creation request
            user_id: The user ID
            
        Returns:
            Created message object
        """
        # Check if chat exists
        chat_data = await self.db_client.get_chat(message_request.chatId)
        if not chat_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chat {message_request.chatId} not found"
            )
        
        # TODO: Check if user has access to the chat's project
        
        # Create message data
        message_data = {
            "chatId": message_request.chatId,
            "content": message_request.content,
            "role": message_request.role,
            "timestamp": datetime.utcnow(),
        }
        
        # Create message in database
        created_message_data = await self.db_client.create_message(message_data)
        
        # Convert to API model
        return self._convert_message_data_to_model(created_message_data)
    
    def _convert_chat_data_to_model(self, chat_data: Dict[str, Any]) -> Chat:
        """
        Convert chat data from database to API model
        
        Args:
            chat_data: Chat data from database
            
        Returns:
            Chat object
        """
        # Convert datetime objects to ISO format strings
        created_at = chat_data.get("createdAt")
        updated_at = chat_data.get("updatedAt")
        
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()
        
        if isinstance(updated_at, datetime):
            updated_at = updated_at.isoformat()
        
        return Chat(
            id=chat_data.get("id"),
            projectId=chat_data.get("projectId"),
            title=chat_data.get("title"),
            createdAt=created_at,
            updatedAt=updated_at
        )
    
    def _convert_message_data_to_model(self, message_data: Dict[str, Any]) -> Message:
        """
        Convert message data from database to API model
        
        Args:
            message_data: Message data from database
            
        Returns:
            Message object
        """
        # Convert datetime object to ISO format string
        timestamp = message_data.get("timestamp")
        if isinstance(timestamp, datetime):
            timestamp = timestamp.isoformat()
        
        return Message(
            id=message_data.get("id"),
            chatId=message_data.get("chatId"),
            content=message_data.get("content"),
            role=message_data.get("role", MessageRole.USER),
            timestamp=timestamp,
            toolCalls=message_data.get("toolCalls"),
            toolResults=message_data.get("toolResults")
        ) 