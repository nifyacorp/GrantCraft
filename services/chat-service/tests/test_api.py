import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime

# Import the FastAPI app
from app.main import app

# Create test client
client = TestClient(app)

# Mock Firebase authentication
@pytest.fixture
def mock_auth():
    with patch("app.auth.verify_token") as mock:
        mock.return_value = {
            "uid": "test-user-id",
            "email": "test@example.com",
            "email_verified": True,
            "display_name": "Test User",
            "photo_url": None
        }
        yield mock

# Mock Firestore client
@pytest.fixture
def mock_firestore():
    with patch("app.database.FirestoreClient") as mock:
        mock_instance = MagicMock()
        mock.return_value = mock_instance
        yield mock_instance

# Test health check endpoint
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "chat-service"}

# Test list chats endpoint
def test_list_chats(mock_auth, mock_firestore):
    # Mock database response
    mock_firestore.list_chats.return_value = [
        {
            "id": "chat-id-1",
            "projectId": "project-id-1",
            "title": "Chat 1",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": "chat-id-2",
            "projectId": "project-id-1",
            "title": "Chat 2",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    # Make request
    response = client.get(
        "/projects/project-id-1/chats",
        headers={"Authorization": "Bearer fake-token"}
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["projectId"] == "project-id-1"
    assert data[0]["title"] == "Chat 1"
    assert data[1]["projectId"] == "project-id-1"
    assert data[1]["title"] == "Chat 2"

# Test create chat endpoint
def test_create_chat(mock_auth, mock_firestore):
    # Mock database response
    now = datetime.utcnow()
    mock_firestore.create_chat.return_value = {
        "id": "new-chat-id",
        "projectId": "project-id-1",
        "title": "New Chat",
        "createdAt": now,
        "updatedAt": now
    }
    
    # Make request
    response = client.post(
        "/projects/project-id-1/chats",
        headers={"Authorization": "Bearer fake-token"},
        json={"projectId": "project-id-1", "title": "New Chat"}
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "new-chat-id"
    assert data["projectId"] == "project-id-1"
    assert data["title"] == "New Chat"

# Test list messages endpoint
def test_list_messages(mock_auth, mock_firestore):
    # Mock database response
    mock_firestore.list_messages.return_value = [
        {
            "id": "message-id-1",
            "chatId": "chat-id-1",
            "content": "Hello",
            "role": "user",
            "timestamp": datetime.utcnow()
        },
        {
            "id": "message-id-2",
            "chatId": "chat-id-1",
            "content": "Hi there!",
            "role": "assistant",
            "timestamp": datetime.utcnow()
        }
    ]
    
    # Make request
    response = client.get(
        "/chats/chat-id-1/messages",
        headers={"Authorization": "Bearer fake-token"}
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["chatId"] == "chat-id-1"
    assert data[0]["content"] == "Hello"
    assert data[0]["role"] == "user"
    assert data[1]["chatId"] == "chat-id-1"
    assert data[1]["content"] == "Hi there!"
    assert data[1]["role"] == "assistant" 