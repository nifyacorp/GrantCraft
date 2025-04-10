"""
Document Generation Tool for GrantCraft.

This tool enables the AI agent to create structured text documents
such as proposal sections, executive summaries, or project descriptions.
"""
from typing import Dict, Any


class DocumentGenerationTool:
    """Tool for generating structured documents for grant proposals."""
    
    def __init__(self, vertex_service):
        """
        Initialize the document generation tool.
        
        Args:
            vertex_service: Service for Vertex AI API interactions
        """
        self.vertex_service = vertex_service
        
    async def generate_document(self, 
                               topic: str, 
                               section_type: str, 
                               requirements: Dict[str, Any] = None, 
                               max_length: int = 1000, 
                               style: str = "academic") -> str:
        """
        Generate a document section based on the given parameters.
        
        Args:
            topic: The main topic or subject
            section_type: Type of section (introduction, methods, background, etc.)
            requirements: Specific requirements for the section
            max_length: Maximum length in words
            style: Writing style (academic, technical, etc.)
            
        Returns:
            Generated document text
        """
        prompt = self._create_prompt(topic, section_type, requirements, max_length, style)
        return await self.vertex_service.generate_text(prompt)
        
    def _create_prompt(self, topic, section_type, requirements, max_length, style):
        """
        Create a detailed prompt for the language model.
        
        Args:
            topic: The main topic or subject
            section_type: Type of section
            requirements: Specific requirements
            max_length: Maximum length in words
            style: Writing style
            
        Returns:
            Formatted prompt string
        """
        return f"""
        Create a {section_type} section for a research grant proposal on {topic}.
        
        Requirements:
        - Maximum length: {max_length} words
        - Style: {style}
        - Specific requirements: {requirements if requirements else 'None'}
        
        The section should be well-structured, evidence-based, and appropriate for an academic grant proposal.
        """ 