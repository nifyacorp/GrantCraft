"""
Budget Generation Tool for GrantCraft.

This tool enables the AI agent to create detailed budgets for grant proposals.
"""
from typing import Dict, Any


class BudgetGenerationTool:
    """Tool for generating and formatting budgets for grant proposals."""
    
    def __init__(self, vertex_service):
        """
        Initialize the budget generation tool.
        
        Args:
            vertex_service: Service for Vertex AI API interactions
        """
        self.vertex_service = vertex_service
        
    async def generate_budget(self, 
                             project_description: str, 
                             total_budget: float, 
                             institution_type: str,
                             duration_months: int) -> Dict[str, Any]:
        """
        Generate a detailed budget based on the project description.
        
        Args:
            project_description: Description of the project
            total_budget: Total budget amount
            institution_type: Type of institution (university, nonprofit, etc.)
            duration_months: Project duration in months
            
        Returns:
            Dictionary containing budget data
        """
        prompt = f"""
        Create a detailed research budget based on this description:
        {project_description}
        
        Total budget: ${total_budget:,.2f}
        Institution type: {institution_type}
        Project duration: {duration_months} months
        
        Provide a comprehensive budget with:
        1. Personnel costs (with appropriate percentages)
        2. Equipment and supplies
        3. Travel costs
        4. Other direct costs
        5. Indirect costs (appropriate for institution type)
        
        For each line item:
        1. Item name/description
        2. Cost calculation
        3. Total cost
        4. Brief justification
        
        Structure as a detailed research budget.
        """
        
        schema = {
            "project_title": "title",
            "total_budget": total_budget,
            "duration_months": duration_months,
            "categories": [
                {
                    "name": "category name",
                    "total": "category total",
                    "items": [
                        {
                            "name": "item name",
                            "description": "description",
                            "calculation": "calculation explanation",
                            "cost": "cost amount",
                            "justification": "brief justification"
                        }
                    ]
                }
            ],
            "direct_costs": "total direct costs",
            "indirect_costs": "total indirect costs",
            "indirect_rate": "indirect rate percentage"
        }
        
        return await self.vertex_service.generate_structured_content(prompt, schema)
        
    async def generate_budget_justification(self, budget_data: Dict[str, Any]) -> str:
        """
        Generate a budget justification narrative based on the budget data.
        
        Args:
            budget_data: Budget data from generate_budget
            
        Returns:
            Budget justification text
        """
        prompt = f"""
        Write a detailed budget justification for a research grant proposal.
        
        Project title: {budget_data.get('project_title', 'Research Project')}
        Total budget: ${budget_data.get('total_budget', 0):,.2f}
        Duration: {budget_data.get('duration_months', 12)} months
        
        Budget categories:
        """
        
        # Add each budget category and its items to the prompt
        for category in budget_data.get('categories', []):
            prompt += f"\n\n{category.get('name', '')}: ${category.get('total', 0):,.2f}\n"
            
            for item in category.get('items', []):
                prompt += f"- {item.get('name', '')}: ${item.get('cost', 0):,.2f}\n"
                prompt += f"  Calculation: {item.get('calculation', '')}\n"
                prompt += f"  Justification: {item.get('justification', '')}\n"
        
        prompt += f"""
        
        Write a comprehensive budget justification that explains each major cost category and justifies why each expense is necessary 
        for the successful completion of the research project. The justification should be clear, detailed, and aligned with 
        the project description. It should explain how the costs were calculated and why they are reasonable.
        """
        
        return await self.vertex_service.generate_text(prompt) 