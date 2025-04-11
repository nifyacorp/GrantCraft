from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import os

try:
    # Use absolute imports instead of relative
    from app.config import settings
    from app.models import Chat, Message, CreateChatRequest, CreateMessageRequest
    from app.services import ChatService
    from app.auth import get_current_user
    
    # Initialize FastAPI app
    app = FastAPI(
        title="GrantCraft Chat Service",
        description="Chat and message management for the GrantCraft system",
        version="0.1.0",
    )
    
    # Default CORS settings if config is unavailable
    cors_origins = ["*"]
    try:
        cors_origins = settings.CORS_ORIGINS
    except:
        print("Warning: Using default CORS settings")
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Initialize Chat Service
    chat_service = ChatService()
except Exception as e:
    print(f"Error during initialization: {str(e)}")
    # Fallback app if there are import or initialization errors
    app = FastAPI(
        title="GrantCraft Chat Service",
        description="Chat and message management for the GrantCraft system (Fallback Mode)",
        version="0.1.0",
    )
    
    # Simplified CORS setup for fallback
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Health check endpoint - Always available
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "chat-service"}

# Rest of the code will only use the chat_service if it's initialized
# Chat endpoints
try:
    @app.get("/projects/{project_id}/chats", response_model=List[Chat])
    async def list_chats(
        project_id: str,
        user: Dict[str, Any] = Depends(get_current_user)
    ):
        """List all chat sessions for a project"""
        try:
            return await chat_service.list_chats(project_id, user["uid"])
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/projects/{project_id}/chats", response_model=Chat)
    async def create_chat(
        project_id: str,
        chat_request: CreateChatRequest,
        user: Dict[str, Any] = Depends(get_current_user)
    ):
        """Create a new chat session for a project"""
        try:
            # Ensure projectId in request matches path parameter
            if chat_request.projectId != project_id:
                raise HTTPException(status_code=400, detail="Project ID mismatch")
                
            return await chat_service.create_chat(chat_request, user["uid"])
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/chats/{chat_id}", response_model=Chat)
    async def get_chat(
        chat_id: str,
        user: Dict[str, Any] = Depends(get_current_user)
    ):
        """Get a specific chat session by ID"""
        try:
            chat = await chat_service.get_chat(chat_id, user["uid"])
            if not chat:
                raise HTTPException(status_code=404, detail="Chat not found")
            return chat
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.delete("/chats/{chat_id}")
    async def delete_chat(
        chat_id: str,
        user: Dict[str, Any] = Depends(get_current_user)
    ):
        """Delete a chat session"""
        try:
            success = await chat_service.delete_chat(chat_id, user["uid"])
            if not success:
                raise HTTPException(status_code=404, detail="Chat not found")
            return {"message": "Chat deleted successfully"}
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # Message endpoints
    @app.get("/chats/{chat_id}/messages", response_model=List[Message])
    async def list_messages(
        chat_id: str,
        limit: Optional[int] = 50,
        offset: Optional[int] = 0,
        user: Dict[str, Any] = Depends(get_current_user)
    ):
        """List messages for a chat session"""
        try:
            return await chat_service.list_messages(chat_id, user["uid"], limit, offset)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/chats/{chat_id}/messages", response_model=Message)
    async def create_message(
        chat_id: str,
        message_request: CreateMessageRequest,
        user: Dict[str, Any] = Depends(get_current_user)
    ):
        """Add a new message to a chat session"""
        try:
            # Ensure chatId in request matches path parameter
            if message_request.chatId != chat_id:
                raise HTTPException(status_code=400, detail="Chat ID mismatch")
                
            return await chat_service.create_message(message_request, user["uid"])
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/messages/{message_id}", response_model=Message)
    async def get_message(
        message_id: str,
        user: Dict[str, Any] = Depends(get_current_user)
    ):
        """Get a specific message by ID"""
        try:
            message = await chat_service.get_message(message_id, user["uid"])
            if not message:
                raise HTTPException(status_code=404, detail="Message not found")
            return message
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
except Exception as e:
    print(f"Error setting up routes: {str(e)}")
    # We don't need to do anything here as the health endpoint will still work

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True) 