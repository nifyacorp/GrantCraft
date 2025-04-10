"""
Timeline Generation Tool for GrantCraft.

This tool enables the AI agent to create project timelines and Gantt charts for grant proposals.
"""
from typing import Dict, Any
import datetime


class TimelineGenerationTool:
    """Tool for generating project timelines and Gantt charts for grant proposals."""
    
    def __init__(self, vertex_service):
        """
        Initialize the timeline generation tool.
        
        Args:
            vertex_service: Service for Vertex AI API interactions
        """
        self.vertex_service = vertex_service
        
    async def generate_timeline(self, 
                               project_description: str, 
                               duration_months: int, 
                               num_milestones: int = 5) -> Dict[str, Any]:
        """
        Generate a project timeline based on the project description.
        
        Args:
            project_description: Description of the project
            duration_months: Total project duration in months
            num_milestones: Number of major milestones
            
        Returns:
            Dictionary containing timeline data
        """
        prompt = f"""
        Create a research project timeline based on this description:
        {project_description}
        
        Total project duration: {duration_months} months
        Number of major milestones: {num_milestones}
        
        For each milestone and task:
        1. Provide a title
        2. Brief description
        3. Start month (relative to project start)
        4. Duration in months
        5. Dependencies (if any)
        
        Structure as a comprehensive project timeline.
        """
        
        schema = {
            "project_title": "title",
            "total_duration": duration_months,
            "milestones": [
                {
                    "title": "milestone title",
                    "description": "milestone description",
                    "month": "start month",
                    "tasks": [
                        {
                            "title": "task title",
                            "description": "task description",
                            "start_month": "start month number",
                            "duration": "duration in months",
                            "dependencies": ["dependent task titles"]
                        }
                    ]
                }
            ]
        }
        
        return await self.vertex_service.generate_structured_content(prompt, schema)
        
    async def generate_gantt_chart_data(self, timeline_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert timeline data to Gantt chart format.
        
        Args:
            timeline_data: Timeline data from generate_timeline
            
        Returns:
            Gantt chart data for visualization
        """
        # Process the timeline data into a format suitable for Gantt chart visualization
        gantt_data = {
            "title": timeline_data.get("project_title", "Research Project"),
            "tasks": []
        }
        
        task_id = 1
        for milestone in timeline_data.get("milestones", []):
            # Add milestone as a task
            gantt_data["tasks"].append({
                "id": f"m{task_id}",
                "name": milestone.get("title", ""),
                "start": self._month_to_date(milestone.get("month", 1)),
                "end": self._month_to_date(milestone.get("month", 1) + 1),
                "progress": 0,
                "type": "milestone"
            })
            
            milestone_id = task_id
            task_id += 1
            
            # Add tasks for this milestone
            for task in milestone.get("tasks", []):
                start_month = task.get("start_month", milestone.get("month", 1))
                duration = task.get("duration", 1)
                
                gantt_data["tasks"].append({
                    "id": f"t{task_id}",
                    "name": task.get("title", ""),
                    "start": self._month_to_date(start_month),
                    "end": self._month_to_date(start_month + duration),
                    "progress": 0,
                    "parent": f"m{milestone_id}"
                })
                task_id += 1
                
        return gantt_data
        
    def _month_to_date(self, month_number: int) -> str:
        """
        Convert a month number to a date string (assuming project starts today).
        
        Args:
            month_number: Month number relative to project start
            
        Returns:
            Date string in YYYY-MM-DD format
        """
        start_date = datetime.datetime.now().replace(day=1)
        target_date = start_date + datetime.timedelta(days=30 * (month_number - 1))
        return target_date.strftime("%Y-%m-%d") 