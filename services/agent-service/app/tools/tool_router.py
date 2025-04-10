"""
Tool Router for GrantCraft.

This module provides a central tool router for orchestrating AI tools.
"""
import asyncio
import inspect
import json
from typing import Dict, Any, List


class ToolRouter:
    """
    Router for managing and executing AI tools.
    
    This class handles:
    1. Tool schema generation for function calling
    2. Tool selection based on tasks
    3. Tool execution with proper parameter validation
    4. Error handling and timeout management
    """
    
    def __init__(self, tools: Dict[str, Any], vertex_service):
        """
        Initialize the tool router.
        
        Args:
            tools: Dictionary of tool instances mapped by name
            vertex_service: Service for Vertex AI API interactions
        """
        self.tools = tools
        self.vertex_service = vertex_service
        self.tool_schemas = self._generate_tool_schemas()
        
    def _generate_tool_schemas(self) -> Dict[str, Dict]:
        """
        Generate OpenAPI-compatible schemas for all registered tools.
        
        Returns:
            Dictionary of tool schemas
        """
        schemas = {}
        for tool_name, tool in self.tools.items():
            schemas[tool_name] = {
                "name": tool_name,
                "description": getattr(tool, "description", f"Tool for {tool_name}"),
                "functions": {}
            }
            
            # Get all public methods that aren't internal
            for method_name in dir(tool):
                if not method_name.startswith('_') and callable(getattr(tool, method_name)):
                    method = getattr(tool, method_name)
                    if hasattr(method, "__annotations__"):
                        # Extract parameter types from type annotations
                        params = {}
                        for param_name, param_type in method.__annotations__.items():
                            if param_name != "return":  # Skip return type annotation
                                params[param_name] = self._type_to_schema(param_type)
                        
                        schemas[tool_name]["functions"][method_name] = {
                            "description": method.__doc__ or f"Method {method_name} for {tool_name}",
                            "parameters": params
                        }
            
        return schemas
    
    def _type_to_schema(self, type_annotation) -> Dict:
        """
        Convert Python type annotation to JSON schema type.
        
        Args:
            type_annotation: Python type annotation
            
        Returns:
            JSON schema type definition
        """
        if type_annotation == str:
            return {"type": "string"}
        elif type_annotation == int:
            return {"type": "integer"}
        elif type_annotation == float:
            return {"type": "number"}
        elif type_annotation == bool:
            return {"type": "boolean"}
        elif type_annotation == List:
            return {"type": "array"}
        elif type_annotation == Dict:
            return {"type": "object"}
        else:
            # Handle more complex types
            return {"type": "object"}
        
    async def select_tools(self, task: str) -> List[str]:
        """
        Select appropriate tools for a given task.
        
        Args:
            task: Task description
            
        Returns:
            List of tool names that should be used
        """
        prompt = f"""
        Given this task:
        {task}
        
        And these available tools:
        {json.dumps(self.tool_schemas, indent=2)}
        
        Select the most appropriate tools to accomplish this task.
        Return a JSON array containing only the tool names.
        """
        
        response = await self.vertex_service.generate_structured_content(
            prompt=prompt,
            response_schema={"type": "array", "items": {"type": "string"}}
        )
        
        # Validate that all returned tools exist
        valid_tools = [name for name in response if name in self.tools]
        
        return valid_tools
        
    async def execute_tool(self, 
                          tool_name: str, 
                          method_name: str, 
                          parameters: Dict[str, Any],
                          context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute a specific tool method with the given parameters.
        
        Args:
            tool_name: Name of the tool to execute
            method_name: Name of the method to call
            parameters: Parameters to pass to the method
            context: Additional context information
            
        Returns:
            Result of tool execution
        """
        if tool_name not in self.tools:
            raise ValueError(f"Tool {tool_name} not found")
            
        tool = self.tools[tool_name]
        
        if not hasattr(tool, method_name) or not callable(getattr(tool, method_name)):
            raise ValueError(f"Method {method_name} not found in tool {tool_name}")
        
        method = getattr(tool, method_name)
        
        # Add context parameters
        if context:
            parameters.update(context)
        
        try:
            # Validate parameters against method signature
            sig = inspect.signature(method)
            for param_name in sig.parameters:
                if param_name not in parameters and sig.parameters[param_name].default == inspect.Parameter.empty:
                    raise ValueError(f"Required parameter '{param_name}' missing for method '{method_name}'")
            
            # Only pass parameters that are accepted by the method
            valid_params = {k: v for k, v in parameters.items() if k in sig.parameters}
            
            # Execute with timeout
            result = await asyncio.wait_for(method(**valid_params), timeout=60)
            return {
                "tool": tool_name,
                "method": method_name,
                "result": result,
                "status": "success"
            }
        except asyncio.TimeoutError:
            return {
                "tool": tool_name,
                "method": method_name,
                "error": "Execution timed out",
                "status": "timeout"
            }
        except Exception as e:
            return {
                "tool": tool_name,
                "method": method_name,
                "error": str(e),
                "status": "error"
            }
    
    async def execute_tools_sequence(self, 
                                    task: str, 
                                    tool_calls: List[Dict[str, Any]], 
                                    context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Execute a sequence of tool calls as determined by the AI.
        
        Args:
            task: Original task description
            tool_calls: List of tool calls with tool name, method and parameters
            context: Context information (user ID, project ID, etc.)
            
        Returns:
            List of results from all tool executions
        """
        results = []
        
        for call in tool_calls:
            tool_name = call.get("tool")
            method = call.get("method")
            params = call.get("parameters", {})
            
            if not tool_name or not method:
                continue
                
            result = await self.execute_tool(tool_name, method, params, context)
            results.append(result)
            
        return results 