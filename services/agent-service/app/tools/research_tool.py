"""
Research Tool for GrantCraft.

This tool enables the AI agent to gather relevant information to support grant proposals.
"""
from typing import Dict, Any, List


class ResearchTool:
    """Tool for researching topics and analyzing funding sources for grant proposals."""
    
    def __init__(self, vertex_service):
        """
        Initialize the research tool.
        
        Args:
            vertex_service: Service for Vertex AI API interactions
        """
        self.vertex_service = vertex_service
        
    async def research_topic(self, topic: str, depth: str = "medium") -> Dict[str, Any]:
        """
        Research a topic and return structured findings.
        
        Args:
            topic: The research topic
            depth: Research depth (basic, medium, comprehensive)
            
        Returns:
            Dictionary containing research findings
        """
        prompt = f"""
        Perform research on the topic: {topic}
        
        Provide a comprehensive analysis including:
        1. Key concepts and definitions
        2. Current state of research
        3. Major trends and developments
        4. Key challenges and gaps
        5. Potential research directions
        
        The depth of research should be: {depth}
        
        Format the output as structured information.
        """
        
        schema = {
            "key_concepts": ["list of concepts"],
            "current_state": "summary of current research",
            "trends": ["list of trends"],
            "challenges": ["list of challenges"],
            "opportunities": ["list of opportunities"],
            "references": ["list of relevant references"]
        }
        
        return await self.vertex_service.generate_structured_content(prompt, schema)
        
    async def analyze_funding_sources(self, research_area: str, institution_type: str = "university") -> List[Dict[str, Any]]:
        """
        Analyze potential funding sources for a research area.
        
        Args:
            research_area: The area of research
            institution_type: Type of institution (university, nonprofit, etc.)
            
        Returns:
            List of potential funding sources with details
        """
        prompt = f"""
        Identify potential funding sources for research in {research_area} for a {institution_type}.
        
        For each funding source, provide:
        1. Name of the funding organization
        2. Relevant grant programs
        3. Typical funding amounts
        4. Application deadlines (if known)
        5. Success rates (if known)
        6. Alignment with {research_area}
        
        Format as a structured list of funding sources.
        """
        
        schema = {
            "funding_sources": [
                {
                    "name": "organization name",
                    "programs": ["list of programs"],
                    "funding_amounts": "typical amounts",
                    "deadlines": "application deadlines",
                    "success_rate": "estimated success rate",
                    "alignment": "high/medium/low"
                }
            ]
        }
        
        result = await self.vertex_service.generate_structured_content(prompt, schema)
        return result.get("funding_sources", []) 