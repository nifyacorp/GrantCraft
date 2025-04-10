from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, Form, File, Body
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

from services.database import DatabaseService
from services.storage import StorageService
from services.auth import get_current_user
from models.file import FileCreate, FileUpdate, File, FileUploadResponse, FileDownloadResponse

router = APIRouter(prefix="/files", tags=["files"])

# Initialize services
db_service = DatabaseService()
storage_service = StorageService()

# Helper function to convert datetime to ISO string
def datetime_to_iso(dt: datetime) -> str:
    return dt.isoformat() + "Z"

# Helper function to convert the file model to the API model
def convert_file_model(file):
    if not file:
        return None
    
    # Convert datetime to ISO string for API responses
    api_file = File(
        **{
            **file.__dict__,
            "createdAt": datetime_to_iso(file.createdAt),
            "updatedAt": datetime_to_iso(file.updatedAt)
        }
    )
    return api_file

@router.get("/projects/{project_id}", response_model=List[File])
async def list_project_files(
    project_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    List all files for a project
    """
    # Get files from database
    files = await db_service.list_files_by_project(project_id)
    
    # Convert to API model
    api_files = [convert_file_model(file) for file in files]
    
    return api_files

@router.post("/projects/{project_id}", response_model=FileUploadResponse)
async def create_file(
    project_id: str,
    file_data: FileCreate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a new file metadata entry and generate an upload URL
    """
    # Ensure the current user is set as the creator
    file_data.createdBy = user["uid"]
    file_data.projectId = project_id
    
    # Generate upload URL
    blob_path, upload_url = storage_service.generate_upload_url(
        user_id=user["uid"],
        project_id=project_id,
        file_name=file_data.name
    )
    
    # Create file metadata in database
    file = await db_service.create_file(file_data, blob_path)
    
    # Convert to API model
    api_file = convert_file_model(file)
    
    return FileUploadResponse(
        file=api_file,
        uploadUrl=upload_url
    )

@router.get("/{file_id}", response_model=File)
async def get_file(
    file_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get a file by ID
    """
    # Get file from database
    file = await db_service.get_file(file_id)
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with ID {file_id} not found"
        )
    
    # Check if user has access to the file
    has_access = await db_service.check_file_access(file_id, user["uid"])
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this file"
        )
    
    # Convert to API model
    api_file = convert_file_model(file)
    
    return api_file

@router.get("/{file_id}/content", response_model=FileDownloadResponse)
async def get_file_content(
    file_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get a signed URL for downloading a file
    """
    # Get file from database
    file = await db_service.get_file(file_id)
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with ID {file_id} not found"
        )
    
    # Check if user has access to the file
    has_access = await db_service.check_file_access(file_id, user["uid"])
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this file"
        )
    
    try:
        # Generate a signed URL for downloading
        download_url = storage_service.generate_download_url(file.path)
        
        # Convert to API model
        api_file = convert_file_model(file)
        
        return FileDownloadResponse(
            file=api_file,
            downloadUrl=download_url
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File content not found in storage"
        )

@router.put("/{file_id}", response_model=File)
async def update_file(
    file_id: str,
    file_update: FileUpdate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update file metadata
    """
    # Check if file exists
    file = await db_service.get_file(file_id)
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with ID {file_id} not found"
        )
    
    # Check if user has access to the file
    has_access = await db_service.check_file_access(file_id, user["uid"])
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this file"
        )
    
    # Update file metadata
    updated_file = await db_service.update_file(file_id, file_update)
    
    # Convert to API model
    api_file = convert_file_model(updated_file)
    
    return api_file

@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Delete a file (both metadata and blob)
    """
    # Get file from database
    file = await db_service.get_file(file_id)
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with ID {file_id} not found"
        )
    
    # Check if user has access to the file
    has_access = await db_service.check_file_access(file_id, user["uid"])
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this file"
        )
    
    try:
        # Delete file from storage
        storage_service.delete_file(file.path)
        
        # Delete file metadata from database
        await db_service.delete_file(file_id)
    except FileNotFoundError:
        # If the file is not found in storage, still delete the metadata
        await db_service.delete_file(file_id) 