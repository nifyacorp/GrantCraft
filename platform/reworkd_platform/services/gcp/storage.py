import io
import os
from typing import Dict, List, Optional

from google.cloud import storage
from google.oauth2 import service_account
from loguru import logger
from pydantic import BaseModel


class PresignedPost(BaseModel):
    url: str
    fields: Dict[str, str]


class CloudStorageService:
    def __init__(self, bucket: Optional[str]) -> None:
        if not bucket:
            raise ValueError("Bucket name must be provided")

        self._bucket_name = bucket
        # If GOOGLE_APPLICATION_CREDENTIALS env var is set, credentials will be loaded automatically
        # Otherwise, use the service account key file specified in settings
        self._client = storage.Client()
        self._bucket = self._client.bucket(bucket)

    def create_presigned_upload_url(
        self,
        object_name: str,
    ) -> PresignedPost:
        # In GCP, generate a signed URL for uploading
        blob = self._bucket.blob(object_name)
        url = blob.generate_signed_url(
            version="v4",
            method="PUT",
            expiration=600,  # 10 minutes
        )
        
        # GCP doesn't use the same presigned post format as AWS
        # Instead, return it in a compatible format for the frontend
        return PresignedPost(
            url=url,
            fields={},  # No fields needed for GCP signed URLs
        )

    def create_presigned_download_url(self, object_name: str) -> str:
        blob = self._bucket.blob(object_name)
        return blob.generate_signed_url(
            version="v4",
            method="GET",
            expiration=600,  # 10 minutes
        )

    def upload_to_bucket(
        self,
        object_name: str,
        file: io.BytesIO,
    ) -> None:
        try:
            blob = self._bucket.blob(object_name)
            blob.upload_from_file(file, rewind=True)
        except Exception as e:
            logger.error(e)
            raise e

    def download_file(self, object_name: str, local_filename: str) -> None:
        blob = self._bucket.blob(object_name)
        blob.download_to_filename(local_filename)

    def list_keys(self, prefix: str) -> List[str]:
        blobs = self._bucket.list_blobs(prefix=prefix)
        return [blob.name for blob in blobs]

    def download_folder(self, prefix: str, path: str) -> List[str]:
        local_files = []
        for key in self.list_keys(prefix):
            local_filename = os.path.join(path, key.split("/")[-1])
            self.download_file(key, local_filename)
            local_files.append(local_filename)

        return local_files

    def delete_folder(self, prefix: str) -> None:
        blobs = self._bucket.list_blobs(prefix=prefix)
        for blob in blobs:
            blob.delete()
