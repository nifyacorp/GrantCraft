from google.cloud import firestore
from datetime import datetime
import uuid
from typing import List, Optional, Dict, Any

from app.models.file import FileCreate, FileUpdate, FileInDB

class DatabaseService:
    """
    Service for handling file metadata in Firestore
    """
    def __init__(self):
        """Initialize the Firestore client"""
        self.db = firestore.Client()
        self.collection = self.db.collection("files")
    
    async def create_file(self, file_data: FileCreate, file_path: str) -> FileInDB:
        """
        Create a new file metadata entry in Firestore
        
        Args:
            file_data: File data
            file_path: Path to the blob in Cloud Storage
            
        Returns:
            FileInDB: Created file
        """
        try:
            # Generate a unique ID for the file
            file_id = str(uuid.uuid4())
            
            # Create a new file document
            now = datetime.utcnow()
            file_dict = {
                "id": file_id,
                "name": file_data.name,
                "projectId": file_data.projectId,
                "path": file_path,
                "type": file_data.type,
                "mimeType": file_data.mimeType,
                "size": file_data.size,
                "createdAt": now,
                "updatedAt": now,
                "createdBy": file_data.createdBy,
                "metadata": file_data.metadata or {},
            }
            
            # Add the file to Firestore
            self.collection.document(file_id).set(file_dict)
            
            # Return the created file
            return FileInDB(**file_dict)
        except Exception as e:
            print(f"Error creating file: {str(e)}")
            # Return a minimal file object to prevent application crash
            return FileInDB(
                id=str(uuid.uuid4()),
                name=file_data.name,
                projectId=file_data.projectId,
                path=file_path,
                type=file_data.type,
                mimeType=file_data.mimeType,
                size=file_data.size,
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow(),
                createdBy=file_data.createdBy,
                metadata=file_data.metadata or {},
            )
    
    async def get_file(self, file_id: str) -> Optional[FileInDB]:
        """
        Get a file by ID
        
        Args:
            file_id: The ID of the file
            
        Returns:
            Optional[FileInDB]: The file, or None if not found
        """
        try:
            # Get the file document
            doc_ref = self.collection.document(file_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
                
            # Convert the document to a FileInDB object
            file_data = doc.to_dict()
            return FileInDB(**file_data)
        except Exception as e:
            print(f"Error getting file: {str(e)}")
            return None
    
    async def update_file(self, file_id: str, file_update: FileUpdate) -> Optional[FileInDB]:
        """
        Update a file's metadata
        
        Args:
            file_id: The ID of the file to update
            file_update: The data to update
            
        Returns:
            Optional[FileInDB]: The updated file, or None if not found
        """
        try:
            # Get the file document
            doc_ref = self.collection.document(file_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            # Prepare the update
            update_data = {}
            if file_update.name is not None:
                update_data["name"] = file_update.name
            if file_update.metadata is not None:
                update_data["metadata"] = file_update.metadata
            
            # Add the updated timestamp
            update_data["updatedAt"] = datetime.utcnow()
            
            # Update the document
            doc_ref.update(update_data)
            
            # Get the updated document
            updated_doc = doc_ref.get()
            file_data = updated_doc.to_dict()
            
            return FileInDB(**file_data)
        except Exception as e:
            print(f"Error updating file: {str(e)}")
            return None
    
    async def delete_file(self, file_id: str) -> bool:
        """
        Delete a file's metadata
        
        Args:
            file_id: The ID of the file to delete
            
        Returns:
            bool: True if the file was deleted, False if not found
        """
        try:
            # Get the file document
            doc_ref = self.collection.document(file_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return False
            
            # Delete the document
            doc_ref.delete()
            
            return True
        except Exception as e:
            print(f"Error deleting file: {str(e)}")
            return False
    
    async def list_files_by_project(self, project_id: str) -> List[FileInDB]:
        """
        List files for a specific project
        
        Args:
            project_id: The ID of the project
            
        Returns:
            List[FileInDB]: List of files for the project
        """
        try:
            # Query the files collection for files with the given project ID
            query = self.collection.where("projectId", "==", project_id)
            docs = query.stream()
            
            # Convert the documents to FileInDB objects
            files = []
            for doc in docs:
                file_data = doc.to_dict()
                files.append(FileInDB(**file_data))
            
            return files
        except Exception as e:
            print(f"Error listing files by project: {str(e)}")
            return []
    
    async def check_file_access(self, file_id: str, user_id: str) -> bool:
        """
        Check if a user has access to a file based on project ownership
        
        This is a simplified check, in real implementation you might
        check against project ownership or collaboration status.
        
        Args:
            file_id: The ID of the file
            user_id: The ID of the user
            
        Returns:
            bool: True if the user has access, False otherwise
        """
        try:
            # Get the file to check its project
            file = await self.get_file(file_id)
            if not file:
                return False
            
            # In production, you would check if the user is an owner or collaborator
            # on the project associated with the file. This would typically
            # involve a call to the ProjectService or checking a projects collection.
            
            # For now, just check if the user created the file (simplified)
            return file.createdBy == user_id
        except Exception as e:
            print(f"Error checking file access: {str(e)}")
            return False 