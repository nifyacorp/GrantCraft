"""
Image Generation Tool for GrantCraft.

This tool enables the AI agent to create visualizations, diagrams, and images for grant proposals.
"""
from typing import Dict, Any


class ImageGenerationTool:
    """Tool for generating prompts and data for images and visualizations."""
    
    def __init__(self, vertex_service):
        """
        Initialize the image generation tool.
        
        Args:
            vertex_service: Service for Vertex AI API interactions
        """
        self.vertex_service = vertex_service
        
    async def generate_prompt(self, 
                             image_type: str, 
                             description: str, 
                             style: str = "professional") -> str:
        """
        Generate a detailed prompt for image generation.
        
        Args:
            image_type: Type of image (diagram, chart, infographic, etc.)
            description: Description of what the image should contain
            style: Visual style of the image
            
        Returns:
            Detailed image generation prompt
        """
        prompt = f"""
        Create a detailed prompt for generating a {style} {image_type} that visualizes:
        {description}
        
        The prompt should include:
        1. Clear description of what to show
        2. Style and visual elements
        3. Color scheme recommendations
        4. Text elements to include
        5. Level of detail needed
        
        The prompt should be detailed enough for a person to create this visualization.
        """
        
        return await self.vertex_service.generate_text(prompt)
        
    async def generate_chart_data(self, 
                                 chart_type: str, 
                                 description: str) -> Dict[str, Any]:
        """
        Generate sample data for a chart.
        
        Args:
            chart_type: Type of chart (bar, line, pie, etc.)
            description: Description of what the chart should show
            
        Returns:
            Sample data for the chart
        """
        prompt = f"""
        Generate realistic sample data for a {chart_type} chart that would illustrate:
        {description}
        
        The data should be structured appropriately for this type of chart and should include:
        1. Labels
        2. Data values (realistic and appropriate for the context)
        3. Any categories or series needed
        4. Appropriate scales and ranges
        
        Format the data in a structured way that could be used with standard charting libraries.
        """
        
        # Define schema based on chart type
        if chart_type == "bar" or chart_type == "line":
            schema = {
                "title": "chart title",
                "x_axis_label": "x-axis label",
                "y_axis_label": "y-axis label",
                "data": [
                    {
                        "label": "category label",
                        "value": "numeric value"
                    }
                ]
            }
        elif chart_type == "pie":
            schema = {
                "title": "chart title",
                "data": [
                    {
                        "label": "segment label",
                        "value": "numeric value",
                        "color": "suggested color (optional)"
                    }
                ]
            }
        else:
            schema = {
                "title": "chart title",
                "data_structure": "appropriate data structure for this chart type",
                "data": "structured data appropriate for this chart type"
            }
        
        return await self.vertex_service.generate_structured_content(prompt, schema) 