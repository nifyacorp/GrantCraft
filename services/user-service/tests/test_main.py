"""Tests for User Service endpoints"""
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.models import User, UserSettings
from datetime import datetime

# Test client
client = TestClient(app)

# Mock user data
MOCK_USER = User(
    id="test-user-id",
    email="test@example.com",
    displayName="Test User",
    photoURL="https://example.com/photo.jpg",
    createdAt=datetime.utcnow().isoformat(),
    lastLogin=datetime.utcnow().isoformat(),
    settings=UserSettings(
        theme="light",
        notifications=True
    )
)

# Mock dependencies
@pytest.fixture
def mock_get_current_user():
    """Fixture to mock the get_current_user dependency"""
    with patch("app.auth.get_current_user") as mock:
        mock.return_value = {
            "uid": "test-user-id",
            "email": "test@example.com",
            "display_name": "Test User"
        }
        yield mock

@pytest.fixture
def mock_user_service():
    """Fixture to mock the UserService"""
    with patch("app.main.user_service") as mock:
        # Mock the get_user method
        mock.get_user = AsyncMock(return_value=MOCK_USER)
        
        # Mock the create_user method
        mock.create_user = AsyncMock(return_value=MOCK_USER)
        
        # Mock the update_user method
        mock.update_user = AsyncMock(return_value=MOCK_USER)
        
        # Mock the update_user_settings method
        mock.update_user_settings = AsyncMock(return_value=MOCK_USER)
        
        # Mock the list_users method
        mock.list_users = AsyncMock(return_value=[MOCK_USER])
        
        yield mock

# Tests
def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "user-service"}

@pytest.mark.asyncio
async def test_get_current_user_profile(mock_get_current_user, mock_user_service):
    """Test getting the current user profile"""
    # Configure the mock to return None first (simulate first login)
    mock_user_service.get_user.side_effect = [None, MOCK_USER]
    
    # Make the request
    response = client.get("/api/v1/users/me")
    
    # Check the response
    assert response.status_code == 200
    assert response.json()["user"]["id"] == MOCK_USER.id
    
    # Verify that create_user was called
    mock_user_service.create_user.assert_called_once()

@pytest.mark.asyncio
async def test_get_user_profile(mock_get_current_user, mock_user_service):
    """Test getting a user profile by ID"""
    # Make the request
    response = client.get("/api/v1/users/test-user-id")
    
    # Check the response
    assert response.status_code == 200
    assert response.json()["user"]["id"] == MOCK_USER.id
    
    # Verify that get_user was called with the correct ID
    mock_user_service.get_user.assert_called_with("test-user-id")

@pytest.mark.asyncio
async def test_update_user_profile(mock_get_current_user, mock_user_service):
    """Test updating a user profile"""
    # Make the request
    response = client.put(
        "/api/v1/users/me",
        json={"displayName": "Updated Name", "photoURL": "https://example.com/new.jpg"}
    )
    
    # Check the response
    assert response.status_code == 200
    assert response.json()["user"]["id"] == MOCK_USER.id
    
    # Verify that update_user was called with the correct data
    mock_user_service.update_user.assert_called_with(
        "test-user-id",
        {"displayName": "Updated Name", "photoURL": "https://example.com/new.jpg"}
    )

@pytest.mark.asyncio
async def test_update_user_settings(mock_get_current_user, mock_user_service):
    """Test updating user settings"""
    # Make the request
    response = client.put(
        "/api/v1/users/me/settings",
        json={"theme": "dark", "notifications": False}
    )
    
    # Check the response
    assert response.status_code == 200
    assert response.json()["user"]["id"] == MOCK_USER.id
    
    # Verify that update_user_settings was called with the correct data
    mock_user_service.update_user_settings.assert_called_with(
        "test-user-id",
        {"theme": "dark", "notifications": False}
    )

@pytest.mark.asyncio
async def test_list_users(mock_get_current_user, mock_user_service):
    """Test listing users"""
    # Make the request
    response = client.get("/api/v1/users")
    
    # Check the response
    assert response.status_code == 200
    assert len(response.json()["users"]) == 1
    assert response.json()["users"][0]["id"] == MOCK_USER.id
    
    # Verify that list_users was called
    mock_user_service.list_users.assert_called_with(50, 0) 