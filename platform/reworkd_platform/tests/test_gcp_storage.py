from unittest.mock import MagicMock

from reworkd_platform.services.gcp.storage import CloudStorageService, PresignedPost


def test_create_signed_post(mocker):
    # Create a mock for the GCP storage client and bucket
    mock_client = MagicMock()
    mock_bucket = MagicMock()
    mock_blob = MagicMock()
    
    # Setup the mock chain
    mocker.patch(
        "reworkd_platform.services.gcp.storage.storage.Client",
        return_value=mock_client
    )
    mock_client.bucket.return_value = mock_bucket
    mock_bucket.blob.return_value = mock_blob
    
    # Mock the signed URL generation
    mock_blob.generate_signed_url.return_value = "https://storage.googleapis.com/my_bucket/my_object"
    
    # Test the service
    service = CloudStorageService(bucket="my_bucket")
    result = service.create_presigned_upload_url(object_name="json")
    
    # Verify the result
    assert result.url == "https://storage.googleapis.com/my_bucket/my_object"
    assert result.fields == {}
    
    # Verify the mock was called correctly
    mock_bucket.blob.assert_called_once_with("json")
    mock_blob.generate_signed_url.assert_called_once()
