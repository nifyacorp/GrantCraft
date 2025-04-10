from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    """
    Message roles
    """
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class ToolCallStatus(str, Enum):
    """
    Tool call status
    """
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class ToolCall(BaseModel):
    """
    Tool call model
    """
    id: str
    toolName: str
    parameters: Dict[str, Any]
    status: ToolCallStatus

class ToolResult(BaseModel):
    """
    Tool result model
    """
    toolCallId: str
    result: Any
    error: Optional[str] = None

class Message(BaseModel):
    """
    Message model
    """
    id: str
    chatId: str
    content: str
    role: MessageRole
    timestamp: str  # ISO date string
    toolCalls: Optional[List[ToolCall]] = None
    toolResults: Optional[List[ToolResult]] = None

class Chat(BaseModel):
    """
    Chat model
    """
    id: str
    projectId: str
    title: str
    createdAt: str  # ISO date string
    updatedAt: str  # ISO date string

# Request models
class CreateChatRequest(BaseModel):
    """
    Create chat request
    """
    projectId: str
    title: str

class CreateMessageRequest(BaseModel):
    """
    Create message request
    """
    chatId: str
    content: str
    role: MessageRole

# Response models with additional metadata
class ChatResponse(Chat):
    """
    Chat response with additional metadata
    """
    messageCount: Optional[int] = None
    lastMessage: Optional[Message] = None

# Database models (for internal use)
class ChatDB(BaseModel):
    """
    Chat database model
    """
    id: str
    projectId: str
    title: str
    createdAt: datetime
    updatedAt: datetime

    def to_api_model(self) -> Chat:
        """Convert to API model"""
        return Chat(
            id=self.id,
            projectId=self.projectId,
            title=self.title,
            createdAt=self.createdAt.isoformat(),
            updatedAt=self.updatedAt.isoformat()
        )

class MessageDB(BaseModel):
    """
    Message database model
    """
    id: str
    chatId: str
    content: str
    role: MessageRole
    timestamp: datetime
    toolCalls: Optional[List[Dict[str, Any]]] = None
    toolResults: Optional[List[Dict[str, Any]]] = None

    def to_api_model(self) -> Message:
        """Convert to API model"""
        # Convert toolCalls if they exist
        tool_calls = None
        if self.toolCalls:
            tool_calls = [ToolCall(**tc) for tc in self.toolCalls]
            
        # Convert toolResults if they exist
        tool_results = None
        if self.toolResults:
            tool_results = [ToolResult(**tr) for tr in self.toolResults]
            
        return Message(
            id=self.id,
            chatId=self.chatId,
            content=self.content,
            role=self.role,
            timestamp=self.timestamp.isoformat(),
            toolCalls=tool_calls,
            toolResults=tool_results
        ) 