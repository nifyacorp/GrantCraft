"""
File Management Tool for GrantCraft.

This tool enables the AI agent to create, modify, and organize files for grant proposals.
"""
from typing import Dict, Any, List
import datetime


class FileManagementTool:
    """Tool for managing files in Cloud Storage for grant proposals."""
    
    def __init__(self, storage_client):
        """
        Initialize the file management tool.
        
        Args:
            storage_client: Google Cloud Storage client
        """
        self.storage_client = storage_client
        self.bucket_name = "grant-craft-files"
        
    async def create_file(self, 
                         user_id: str, 
                         project_id: str, 
                         filename: str, 
                         content: str, 
                         file_type: str = "document") -> Dict[str, Any]:
        """
        Create a new file in Cloud Storage.
        
        Args:
            user_id: User identifier
            project_id: Project identifier
            filename: Name of the file
            content: File content
            file_type: Type of file (document, spreadsheet, etc.)
            
        Returns:
            File metadata
        """
        file_path = f"{user_id}/{project_id}/{filename}"
        
        # Create the file in Cloud Storage
        bucket = self.storage_client.bucket(self.bucket_name)
        blob = bucket.blob(file_path)
        blob.upload_from_string(content)
        
        # Generate metadata
        metadata = {
            "id": blob.name,
            "name": filename,
            "path": file_path,
            "type": file_type,
            "size": len(content),
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "url": f"https://storage.googleapis.com/{self.bucket_name}/{file_path}"
        }
        
        return metadata
        
    async def list_files(self, user_id: str, project_id: str) -> List[Dict[str, Any]]:
        """
        List all files for a project.
        
        Args:
            user_id: User identifier
            project_id: Project identifier
            
        Returns:
            List of file metadata
        """
        prefix = f"{user_id}/{project_id}/"
        bucket = self.storage_client.bucket(self.bucket_name)
        blobs = bucket.list_blobs(prefix=prefix)
        
        files = []
        for blob in blobs:
            filename = blob.name.split('/')[-1]
            file_type = self._get_file_type(filename)
            
            files.append({
                "id": blob.name,
                "name": filename,
                "path": blob.name,
                "type": file_type,
                "size": blob.size,
                "created_at": blob.time_created.isoformat() if blob.time_created else None,
                "updated_at": blob.updated.isoformat() if blob.updated else None,
                "url": f"https://storage.googleapis.com/{self.bucket_name}/{blob.name}"
            })
            
        return files
        
    def _get_file_type(self, filename: str) -> str:
        """
        Determine file type based on extension.
        
        Args:
            filename: Name of the file
            
        Returns:
            Type of file as a string
        """
        if filename.endswith(('.md', '.txt', '.doc', '.docx')):
            return "document"
        elif filename.endswith(('.jpg', '.jpeg', '.png', '.gif')):
            return "image"
        elif filename.endswith(('.xls', '.xlsx', '.csv')):
            return "spreadsheet"
        else:
            return "other" 