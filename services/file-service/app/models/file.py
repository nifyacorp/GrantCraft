from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, Literal
from datetime import datetime

# File type enum
FileType = Literal["document", "image", "spreadsheet", "other"]

class FileBase(BaseModel):
    """Base file model with common attributes"""
    name: str
    projectId: str
    type: FileType = "other"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class FileCreate(FileBase):
    """Model for file creation"""
    path: Optional[str] = None
    mimeType: str
    size: int
    createdBy: str

class FileUpdate(BaseModel):
    """Model for file update"""
    name: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class FileInDB(FileBase):
    """File model as stored in the database"""
    id: str
    path: str
    mimeType: str
    size: int
    createdAt: datetime
    updatedAt: datetime
    createdBy: str
    url: Optional[str] = None

class File(FileInDB):
    """File model as returned to clients"""
    createdAt: str  # ISO date string
    updatedAt: str  # ISO date string

class FileUploadResponse(BaseModel):
    """Response model for file upload request"""
    file: File
    uploadUrl: str

class FileDownloadResponse(BaseModel):
    """Response model for file download request"""
    file: File
    downloadUrl: str 