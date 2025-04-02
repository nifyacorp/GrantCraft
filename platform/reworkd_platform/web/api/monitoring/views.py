from fastapi import APIRouter, Request, Response
import logging
import os
from datetime import datetime
import platform
import json
from typing import Dict, List, Optional
import asyncio

# Create an in-memory buffer for recent errors
recent_errors: List[Dict] = []
MAX_ERRORS = 100

# Setup a custom error handler to capture errors
class ErrorCaptureHandler(logging.Handler):
    def emit(self, record):
        global recent_errors
        if record.levelno >= logging.ERROR:
            error_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "level": record.levelname,
                "message": record.getMessage(),
                "module": record.module,
                "line": record.lineno
            }
            recent_errors.append(error_entry)
            if len(recent_errors) > MAX_ERRORS:
                recent_errors.pop(0)  # Remove oldest error

# Add the handler to root logger
error_handler = ErrorCaptureHandler()
logging.getLogger().addHandler(error_handler)
logging.getLogger().setLevel(logging.INFO)

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check that returns service status"""
    return {
        "service": "backend",
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": os.environ.get("VERSION", "development")
    }

@router.get("/ping")
async def ping():
    """Simple ping endpoint that returns pong"""
    return {"ping": "pong"}

@router.get("/errors")
async def get_errors(password: str = None):
    """Get recent errors - protected with a simple password"""
    # In a real app, use proper auth instead of this simple password
    if password != os.environ.get("DEBUG_PASSWORD", "GrantCraft2025!Debug"):
        return Response(status_code=403, content="Unauthorized")
    
    return {
        "errors": recent_errors,
        "count": len(recent_errors)
    }

@router.get("/test/login")
async def test_login(username: str = "test@example.com", password: str = "password123"):
    """Test the login functionality without actually creating a user"""
    try:
        # Simulate login process
        await asyncio.sleep(0.5)  # Simulate processing time
        
        # This is just a test endpoint - in a real app, you'd use your actual auth logic
        # But keep it separate from production code
        if username and password:
            return {
                "status": "success",
                "test": "login",
                "message": f"Login simulation for {username} completed",
                "would_succeed": True
            }
        else:
            return {
                "status": "error",
                "test": "login", 
                "message": "Missing username or password",
                "would_succeed": False
            }
    except Exception as e:
        logging.error(f"Login test failed: {str(e)}")
        return {
            "status": "error",
            "test": "login",
            "message": f"Test failed: {str(e)}",
            "would_succeed": False
        }

@router.get("/test/database")
async def test_database(password: str = None):
    """Test database connectivity - protected with a simple password"""
    if password != os.environ.get("DEBUG_PASSWORD", "GrantCraft2025!Debug"):
        return Response(status_code=403, content="Unauthorized")
    
    try:
        from sqlalchemy import text
        from reworkd_platform.db.dependencies import get_db_session
        
        # Get a database session
        session = await get_db_session()
        
        # Try a simple query
        result = await session.execute(text("SELECT 1"))
        is_connected = result.scalar() == 1
        
        if is_connected:
            # Get some basic database info
            version_result = await session.execute(text("SELECT VERSION()"))
            version = version_result.scalar()
            
            return {
                "status": "success",
                "connected": True,
                "version": version,
                "message": "Database connection successful"
            }
        else:
            return {
                "status": "error",
                "connected": False,
                "message": "Database query did not return expected result"
            }
    except Exception as e:
        logging.error(f"Database test failed: {str(e)}")
        return {
            "status": "error",
            "connected": False,
            "message": f"Database test failed: {str(e)}"
        }