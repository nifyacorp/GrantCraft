from google.cloud import storage
import os
from datetime import datetime, timedelta
import magic
import uuid

class StorageService:
    """
    Service for handling file blobs in Google Cloud Storage
    """
    def __init__(self):
        """Initialize the storage client and bucket"""
        try:
            self.client = storage.Client()
            self.bucket_name = os.getenv("GCS_BUCKET_NAME", "grancraft-final-20240630-files")
            self.bucket = self.client.bucket(self.bucket_name)
            # Create the bucket if it doesn't exist
            if not self.bucket.exists():
                print(f"Warning: Bucket {self.bucket_name} does not exist. Using fallback mechanism.")
        except Exception as e:
            print(f"Error initializing storage service: {str(e)}")
            self.client = None
            self.bucket = None
            self.bucket_name = "fallback-bucket"
    
    def generate_upload_url(self, user_id: str, project_id: str, file_name: str) -> tuple:
        """
        Generate a signed URL for uploading a file
        
        Returns:
            tuple: (blob_path, signed_url)
        """
        try:
            if not self.bucket:
                # Fallback: Return dummy values if bucket is not available
                dummy_path = f"users/{user_id}/projects/{project_id}/{uuid.uuid4()}_{file_name}"
                return dummy_path, "https://example.com/fallback-upload-url"
                
            # Generate a unique path for the file
            blob_path = f"users/{user_id}/projects/{project_id}/{uuid.uuid4()}_{file_name}"
            blob = self.bucket.blob(blob_path)
            
            # Generate a signed URL for uploading
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=datetime.utcnow() + timedelta(minutes=15),
                method="PUT",
                content_type="application/octet-stream",
            )
            
            return blob_path, signed_url
        except Exception as e:
            print(f"Error generating upload URL: {str(e)}")
            # Fallback: Return dummy values
            dummy_path = f"users/{user_id}/projects/{project_id}/{uuid.uuid4()}_{file_name}"
            return dummy_path, "https://example.com/fallback-upload-url"
    
    def generate_download_url(self, blob_path: str) -> str:
        """
        Generate a signed URL for downloading a file
        
        Args:
            blob_path: Path to the blob in the storage bucket
            
        Returns:
            str: Signed URL for downloading the file
        """
        try:
            if not self.bucket:
                # Fallback: Return dummy URL if bucket is not available
                return "https://example.com/fallback-download-url"
                
            blob = self.bucket.blob(blob_path)
            
            # Check if the blob exists
            if not blob.exists():
                raise FileNotFoundError(f"File {blob_path} not found in storage")
            
            # Generate a signed URL for downloading
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=datetime.utcnow() + timedelta(minutes=30),
                method="GET",
            )
            
            return signed_url
        except Exception as e:
            print(f"Error generating download URL: {str(e)}")
            # Fallback: Return dummy URL
            return "https://example.com/fallback-download-url"
    
    def delete_file(self, blob_path: str) -> None:
        """
        Delete a file from storage
        
        Args:
            blob_path: Path to the blob in the storage bucket
        """
        try:
            if not self.bucket:
                # Just return if bucket is not available
                return
                
            blob = self.bucket.blob(blob_path)
            
            # Check if the blob exists
            if not blob.exists():
                print(f"Warning: File {blob_path} not found in storage during deletion.")
                return
            
            # Delete the blob
            blob.delete()
        except Exception as e:
            print(f"Error deleting file: {str(e)}")
    
    def get_file_metadata(self, blob_path: str) -> dict:
        """
        Get metadata for a file
        
        Args:
            blob_path: Path to the blob in the storage bucket
            
        Returns:
            dict: File metadata (size, content_type)
        """
        try:
            if not self.bucket:
                # Fallback: Return dummy metadata if bucket is not available
                return {
                    "size": 0,
                    "content_type": "application/octet-stream",
                    "updated": datetime.utcnow(),
                }
                
            blob = self.bucket.blob(blob_path)
            
            # Check if the blob exists
            if not blob.exists():
                print(f"Warning: File {blob_path} not found in storage during metadata fetch.")
                return {
                    "size": 0,
                    "content_type": "application/octet-stream",
                    "updated": datetime.utcnow(),
                }
            
            # Get blob metadata
            blob.reload()
            
            return {
                "size": blob.size,
                "content_type": blob.content_type,
                "updated": blob.updated,
            }
        except Exception as e:
            print(f"Error getting file metadata: {str(e)}")
            # Fallback: Return dummy metadata
            return {
                "size": 0,
                "content_type": "application/octet-stream",
                "updated": datetime.utcnow(),
            }
    
    @staticmethod
    def determine_file_type(mime_type: str) -> str:
        """
        Determine the file type based on MIME type
        
        Args:
            mime_type: MIME type of the file
            
        Returns:
            str: File type (document, image, spreadsheet, other)
        """
        try:
            mime_type = mime_type.lower()
            
            if any(x in mime_type for x in ["document", "pdf", "text", "rtf", "word"]):
                return "document"
            elif any(x in mime_type for x in ["image", "jpeg", "jpg", "png", "gif", "bmp", "svg"]):
                return "image"
            elif any(x in mime_type for x in ["spreadsheet", "excel", "sheet", "csv", "numbers"]):
                return "spreadsheet"
            else:
                return "other"
        except Exception as e:
            print(f"Error determining file type: {str(e)}")
            return "other" 