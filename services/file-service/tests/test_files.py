import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json
from datetime import datetime
import uuid

# Import the FastAPI app
from app.main import app

# Create a test client
client = TestClient(app)

# Mock user for authentication
mock_user = {
    "uid": "test-user-123",
    "email": "test@example.com"
}

# Mock file data
mock_file_id = str(uuid.uuid4())
mock_project_id = str(uuid.uuid4())
mock_file = {
    "id": mock_file_id,
    "name": "test-file.txt",
    "projectId": mock_project_id,
    "path": f"users/test-user-123/projects/{mock_project_id}/test-file.txt",
    "type": "document",
    "mimeType": "text/plain",
    "size": 1024,
    "createdAt": datetime.utcnow(),
    "updatedAt": datetime.utcnow(),
    "createdBy": "test-user-123",
    "metadata": {}
}

# Mock methods
@pytest.fixture
def mock_auth():
    with patch("app.services.auth.verify_token") as mock:
        mock.return_value = mock_user
        yield mock

@pytest.fixture
def mock_db_service():
    with patch("app.routers.files.db_service") as mock:
        mock.get_file.return_value = MagicMock(**mock_file)
        mock.list_files_by_project.return_value = [MagicMock(**mock_file)]
        mock.create_file.return_value = MagicMock(**mock_file)
        mock.update_file.return_value = MagicMock(**mock_file)
        mock.delete_file.return_value = True
        mock.check_file_access.return_value = True
        yield mock

@pytest.fixture
def mock_storage_service():
    with patch("app.routers.files.storage_service") as mock:
        mock.generate_upload_url.return_value = (
            f"users/test-user-123/projects/{mock_project_id}/test-file.txt",
            "https://storage.googleapis.com/signed-upload-url"
        )
        mock.generate_download_url.return_value = "https://storage.googleapis.com/signed-download-url"
        yield mock

def test_list_project_files(mock_auth, mock_db_service):
    response = client.get(f"/files/projects/{mock_project_id}", headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    mock_db_service.list_files_by_project.assert_called_once_with(mock_project_id)

def test_create_file(mock_auth, mock_db_service, mock_storage_service):
    file_data = {
        "name": "new-file.txt",
        "projectId": mock_project_id,
        "type": "document",
        "mimeType": "text/plain",
        "size": 2048,
        "createdBy": "test-user-123"
    }
    
    response = client.post(
        f"/files/projects/{mock_project_id}",
        json=file_data,
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response.status_code == 200
    assert "file" in response.json()
    assert "uploadUrl" in response.json()
    assert response.json()["uploadUrl"] == "https://storage.googleapis.com/signed-upload-url"

def test_get_file(mock_auth, mock_db_service):
    response = client.get(f"/files/{mock_file_id}", headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    assert response.json()["id"] == mock_file_id
    mock_db_service.get_file.assert_called_once_with(mock_file_id)
    mock_db_service.check_file_access.assert_called_once_with(mock_file_id, mock_user["uid"])

def test_get_file_content(mock_auth, mock_db_service, mock_storage_service):
    response = client.get(f"/files/{mock_file_id}/content", headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    assert "file" in response.json()
    assert "downloadUrl" in response.json()
    assert response.json()["downloadUrl"] == "https://storage.googleapis.com/signed-download-url"
    mock_storage_service.generate_download_url.assert_called_once()

def test_update_file(mock_auth, mock_db_service):
    file_update = {
        "name": "updated-file.txt",
        "metadata": {"tags": ["important"]}
    }
    
    response = client.put(
        f"/files/{mock_file_id}",
        json=file_update,
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response.status_code == 200
    assert response.json()["id"] == mock_file_id
    mock_db_service.update_file.assert_called_once()

def test_delete_file(mock_auth, mock_db_service, mock_storage_service):
    response = client.delete(f"/files/{mock_file_id}", headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 204
    mock_db_service.delete_file.assert_called_once_with(mock_file_id)
    mock_storage_service.delete_file.assert_called_once()

def test_unauthorized_access():
    response = client.get(f"/files/{mock_file_id}")
    assert response.status_code == 403  # or 401 depending on your implementation 