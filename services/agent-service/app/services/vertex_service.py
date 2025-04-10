"""
Vertex AI Service for GrantCraft.

This service provides a wrapper around the Vertex AI API for the AI tools.
"""
import json
import os
import logging
from typing import Dict, Any, List, Optional, Union

# Import the required Google Cloud libraries
try:
    from google.cloud import aiplatform
    from google.protobuf import json_format
    from google.protobuf.struct_pb2 import Value
except ImportError:
    logging.warning("Google Cloud libraries not installed. VertexService will not function properly.")


class VertexService:
    """
    Service for interacting with Vertex AI APIs.
    
    This class provides methods for:
    1. Text generation
    2. Structured content generation with schemas
    3. Error handling for API calls
    """
    
    def __init__(self, project_id: str, location: str = "us-central1", model_name: str = "gemini-1.0-pro"):
        """
        Initialize the Vertex AI service.
        
        Args:
            project_id: Google Cloud project ID
            location: Google Cloud region
            model_name: Vertex AI model name
        """
        self.project_id = project_id
        self.location = location
        self.model_name = model_name
        self.endpoint = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/publishers/google/models/{model_name}:generateContent"
        
        # Initialize Vertex AI client
        try:
            aiplatform.init(project=project_id, location=location)
            self.endpoint = aiplatform.Endpoint(f"projects/{project_id}/locations/{location}/publishers/google/models/{model_name}")
            logging.info(f"Initialized Vertex AI client for model {model_name}")
        except Exception as e:
            logging.error(f"Failed to initialize Vertex AI client: {str(e)}")
            raise
    
    async def generate_text(self, prompt: str, max_tokens: int = 1024) -> str:
        """
        Generate text using the Vertex AI model.
        
        Args:
            prompt: The prompt for text generation
            max_tokens: Maximum number of tokens to generate
            
        Returns:
            Generated text
        """
        try:
            # Create the request
            instance = {"prompt": prompt}
            parameters = {
                "temperature": 0.2,
                "maxOutputTokens": max_tokens,
                "topP": 0.9,
                "topK": 40
            }
            
            # Call the model
            response = self.endpoint.predict(
                instances=[instance],
                parameters=parameters
            )
            
            # Extract the generated text from the response
            if response and response.predictions:
                return response.predictions[0]
            else:
                logging.warning("Empty response from Vertex AI")
                return ""
                
        except Exception as e:
            logging.error(f"Error generating text: {str(e)}")
            return f"Error generating text: {str(e)}"
    
    async def generate_structured_content(self, prompt: str, response_schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate structured content using the Vertex AI model with a schema.
        
        Args:
            prompt: The prompt for content generation
            response_schema: JSON schema for the response
            
        Returns:
            Structured content as a dictionary
        """
        try:
            # Create the request with function calling
            instance = {
                "contents": [{
                    "role": "user",
                    "parts": [{"text": prompt}]
                }]
            }
            
            # Define function schema
            function_declarations = [{
                "name": "generate_structured_response",
                "description": "Generate a structured response based on the provided schema",
                "parameters": response_schema
            }]
            
            parameters = {
                "temperature": 0.2,
                "maxOutputTokens": 2048,
                "topP": 0.9,
                "topK": 40,
                "function_declarations": function_declarations,
                "function_calling_config": {
                    "mode": "ANY"
                }
            }
            
            # Call the model
            response = self.endpoint.predict(
                instances=[instance],
                parameters=parameters
            )
            
            # Extract the structured content from the function call
            if response and response.predictions:
                # Parse function call response
                function_call = response.predictions[0].get("function_call", {})
                if function_call and "parameters" in function_call:
                    return json.loads(function_call["parameters"])
                else:
                    logging.warning("No function call in the response")
                    return {}
            else:
                logging.warning("Empty response from Vertex AI")
                return {}
                
        except Exception as e:
            logging.error(f"Error generating structured content: {str(e)}")
            return {} 