"""
Agent Handler for GrantCraft.

This module provides the main agent handler for coordinating AI tools.
"""
import json
import logging
from typing import Dict, Any, List, Optional

from .services.vertex_service import VertexService
from .tools.document_generation_tool import DocumentGenerationTool
from .tools.research_tool import ResearchTool
from .tools.file_management_tool import FileManagementTool
from .tools.timeline_generation_tool import TimelineGenerationTool
from .tools.budget_generation_tool import BudgetGenerationTool
from .tools.image_generation_tool import ImageGenerationTool
from .tools.tool_router import ToolRouter


class AgentHandler:
    """
    Main agent handler for GrantCraft.
    
    This class:
    1. Initializes all AI tools
    2. Processes user requests
    3. Routes tasks to appropriate tools
    4. Aggregates and returns results
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the agent handler.
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
        
        # Initialize services
        self.vertex_service = VertexService(
            project_id=config.get("project_id", ""),
            location=config.get("location", "us-central1"),
            model_name=config.get("model_name", "gemini-1.0-pro")
        )
        
        # Initialize storage client (placeholder)
        self.storage_client = self._init_storage_client()
        
        # Initialize tools
        self.tools = {
            "document_generation": DocumentGenerationTool(self.vertex_service),
            "research": ResearchTool(self.vertex_service),
            "file_management": FileManagementTool(self.storage_client),
            "timeline_generation": TimelineGenerationTool(self.vertex_service),
            "budget_generation": BudgetGenerationTool(self.vertex_service),
            "image_generation": ImageGenerationTool(self.vertex_service)
        }
        
        # Initialize tool router
        self.tool_router = ToolRouter(self.tools, self.vertex_service)
        
        logging.info("Agent handler initialized with %d tools", len(self.tools))
        
    def _init_storage_client(self):
        """
        Initialize the storage client.
        
        Returns:
            Storage client instance (placeholder)
        """
        # This is a placeholder for the actual storage client initialization
        # In a real implementation, this would use Google Cloud Storage or similar
        class StorageClientPlaceholder:
            def bucket(self, name):
                return self
                
            def blob(self, path):
                return self
                
            def upload_from_string(self, content):
                logging.info(f"Would upload {len(content)} bytes")
                return True
                
            def list_blobs(self, prefix=""):
                logging.info(f"Would list blobs with prefix {prefix}")
                return []
        
        return StorageClientPlaceholder()
        
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a user request using the appropriate tools.
        
        Args:
            request: User request dictionary
            
        Returns:
            Response dictionary
        """
        try:
            task = request.get("task", "")
            user_id = request.get("user_id", "")
            project_id = request.get("project_id", "")
            
            logging.info(f"Processing request: {task}")
            
            # Select appropriate tools for the task
            selected_tools = await self.tool_router.select_tools(task)
            logging.info(f"Selected tools: {selected_tools}")
            
            # Determine tool calls
            tool_calls = await self._determine_tool_calls(task, selected_tools)
            logging.info(f"Determined tool calls: {json.dumps(tool_calls)}")
            
            # Execute the tools
            context = {
                "user_id": user_id,
                "project_id": project_id
            }
            results = await self.tool_router.execute_tools_sequence(task, tool_calls, context)
            
            # Process and return the results
            response = self._format_response(results)
            return response
            
        except Exception as e:
            logging.error(f"Error processing request: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "message": "Failed to process request"
            }
    
    async def _determine_tool_calls(self, task: str, selected_tools: List[str]) -> List[Dict[str, Any]]:
        """
        Determine the specific tool calls to make for the task.
        
        Args:
            task: The user task
            selected_tools: List of selected tool names
            
        Returns:
            List of tool call specifications
        """
        # Create a prompt to determine the tool calls
        tool_schemas = {name: schema for name, schema in self.tool_router.tool_schemas.items() 
                      if name in selected_tools}
        
        prompt = f"""
        Given this task: {task}
        
        And these available tools:
        {json.dumps(tool_schemas, indent=2)}
        
        Determine the specific tool calls needed to complete this task.
        For each tool call, specify:
        1. The tool name
        2. The method to call
        3. The parameters to pass
        
        Format the response as a JSON array of tool calls.
        """
        
        schema = {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "tool": {"type": "string"},
                    "method": {"type": "string"},
                    "parameters": {"type": "object"}
                },
                "required": ["tool", "method", "parameters"]
            }
        }
        
        response = await self.vertex_service.generate_structured_content(prompt, schema)
        
        if not response:
            return []
            
        return response
        
    def _format_response(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Format the results into a response.
        
        Args:
            results: List of tool execution results
            
        Returns:
            Formatted response
        """
        successful_results = [r for r in results if r.get("status") == "success"]
        failed_results = [r for r in results if r.get("status") != "success"]
        
        return {
            "status": "success" if not failed_results else "partial_success" if successful_results else "error",
            "results": successful_results,
            "errors": failed_results,
            "message": f"Completed {len(successful_results)} of {len(results)} operations"
        } 