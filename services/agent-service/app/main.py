"""
Main Application for GrantCraft Agent Service.

This module provides the main entry point for the agent service.
"""
import os
import json
import logging
import asyncio
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .agent_handler import AgentHandler


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create FastAPI app
app = FastAPI(
    title="GrantCraft Agent Service",
    description="AI agent service for grant proposal preparation",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load configuration
def load_config() -> Dict[str, Any]:
    """
    Load configuration from environment variables or config file.
    
    Returns:
        Configuration dictionary
    """
    # Get port from environment for Cloud Run compatibility
    port = os.environ.get("PORT", "8000")
    logging.info(f"Using PORT from environment: {port}")
    
    # Get the project ID from environment
    project_id = os.environ.get("GCP_PROJECT_ID", "")
    if not project_id:
        logging.warning("GCP_PROJECT_ID environment variable is not set. Some features may not work properly.")
    
    config = {
        "project_id": project_id,
        "location": os.environ.get("GCP_LOCATION", "us-central1"),
        "model_name": os.environ.get("VERTEX_MODEL", "gemini-1.0-pro"),
        "port": int(port)
    }
    
    # Log all configuration keys (without sensitive values)
    logging.info(f"Configuration keys: {', '.join(config.keys())}")
    
    # Check if config file exists
    config_path = os.environ.get("CONFIG_PATH", "config.json")
    if os.path.exists(config_path):
        try:
            with open(config_path, "r") as f:
                file_config = json.load(f)
                config.update(file_config)
                logging.info(f"Loaded configuration from {config_path}")
        except Exception as e:
            logging.error(f"Error loading config file: {str(e)}")
    
    return config

# Initialize agent handler on startup
agent_handler = None

@app.on_event("startup")
async def startup_event():
    """Initialize the agent handler on startup."""
    global agent_handler
    try:
        config = load_config()
        agent_handler = AgentHandler(config)
        logging.info("Agent handler initialized successfully")
    except Exception as e:
        logging.error(f"Failed to initialize agent handler: {str(e)}")
        # Don't raise the exception, just log it
        # The app will continue to run with agent_handler as None,
        # and endpoints will return appropriate error messages

# Define request model
class AgentRequest(BaseModel):
    task: str
    user_id: str
    project_id: str
    parameters: Dict[str, Any] = {}

# Define API endpoints
@app.post("/api/agent/process")
async def process_request(request: AgentRequest):
    """
    Process a request using the agent handler.
    
    Args:
        request: Agent request
        
    Returns:
        Agent response
    """
    global agent_handler
    if not agent_handler:
        raise HTTPException(status_code=500, detail="Agent handler not initialized")
    
    request_dict = {
        "task": request.task,
        "user_id": request.user_id,
        "project_id": request.project_id,
        **request.parameters
    }
    
    response = await agent_handler.process_request(request_dict)
    return response

@app.get("/api/agent/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        Health status
    """
    return {"status": "healthy", "agent_handler_initialized": agent_handler is not None}

@app.get("/api/agent/tools")
async def list_tools():
    """
    List available tools.
    
    Returns:
        List of available tools
    """
    global agent_handler
    if not agent_handler:
        return {"status": "error", "message": "Agent handler not initialized", "tools": []}
    
    return {"tools": list(agent_handler.tools.keys())}

# Main function for running the app directly
if __name__ == "__main__":
    import uvicorn
    
    # Get port from config
    config = load_config()
    port = config.get("port", 8000)
    
    # Run the application
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True) 