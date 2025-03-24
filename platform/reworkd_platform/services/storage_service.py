import io
from typing import Dict, List, Optional

from loguru import logger
from pydantic import BaseModel

from reworkd_platform.settings import settings


class PresignedPost(BaseModel):
    url: str
    fields: Dict[str, str]


class StorageService:
    """
    Abstract base storage service that uses the appropriate implementation
    based on configuration.
    """

    def __init__(self, bucket: Optional[str] = None) -> None:
        """Initialize the appropriate storage service."""
        self._service = None

        # Determine which storage service to use based on settings
        if settings.gcp_project_id and settings.gcp_storage_bucket:
            from reworkd_platform.services.gcp.storage import CloudStorageService
            self._service = CloudStorageService(bucket or settings.gcp_storage_bucket)
        else:
            # Fall back to AWS S3
            from reworkd_platform.services.aws.s3 import SimpleStorageService
            if not bucket:
                logger.warning("No bucket specified for S3 storage service")
            self._service = SimpleStorageService(bucket)

    def create_presigned_upload_url(self, object_name: str) -> PresignedPost:
        """Create a presigned URL for uploading a file."""
        return self._service.create_presigned_upload_url(object_name)

    def create_presigned_download_url(self, object_name: str) -> str:
        """Create a presigned URL for downloading a file."""
        return self._service.create_presigned_download_url(object_name)

    def upload_to_bucket(self, object_name: str, file: io.BytesIO) -> None:
        """Upload a file to the storage bucket."""
        self._service.upload_to_bucket(object_name, file)

    def download_file(self, object_name: str, local_filename: str) -> None:
        """Download a file from the storage bucket."""
        self._service.download_file(object_name, local_filename)

    def list_keys(self, prefix: str) -> List[str]:
        """List objects in the storage bucket with the given prefix."""
        return self._service.list_keys(prefix)

    def download_folder(self, prefix: str, path: str) -> List[str]:
        """Download a folder from the storage bucket."""
        return self._service.download_folder(prefix, path)

    def delete_folder(self, prefix: str) -> None:
        """Delete a folder from the storage bucket."""
        self._service.delete_folder(prefix)