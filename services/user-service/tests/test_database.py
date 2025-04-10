"""Tests for the Database module"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import datetime
from app.database import FirestoreClient
from app.models import UserDB, UserSettingsDB

@pytest.fixture
def mock_firestore():
    """Mock the Firestore client"""
    with patch("google.cloud.firestore.Client") as mock_client:
        # Setup the mock collection and document references
        mock_collection = MagicMock()
        mock_client.return_value.collection.return_value = mock_collection
        
        # Setup document reference mock
        mock_doc_ref = MagicMock()
        mock_collection.document.return_value = mock_doc_ref
        
        # Setup document snapshot mock
        mock_doc = MagicMock()
        mock_doc_ref.get.return_value = mock_doc
        
        # Setup streaming query results
        mock_docs = [mock_doc]
        mock_collection.limit.return_value.offset.return_value.stream.return_value = mock_docs
        
        yield mock_client

@pytest.mark.asyncio
async def test_get_user(mock_firestore):
    """Test getting a user by ID"""
    # Sample user data
    test_user_data = {
        'id': 'test-user-id',
        'email': 'test@example.com',
        'displayName': 'Test User',
        'photoURL': 'https://example.com/photo.jpg',
        'createdAt': datetime.utcnow(),
        'lastLogin': datetime.utcnow(),
        'settings': {
            'theme': 'light',
            'notifications': True
        }
    }
    
    # Configure the document to exist and return our test data
    mock_doc = mock_firestore.return_value.collection.return_value.document.return_value.get.return_value
    mock_doc.exists = True
    mock_doc.to_dict.return_value = test_user_data
    
    # Create an instance of FirestoreClient and call get_user
    client = FirestoreClient()
    user = await client.get_user('test-user-id')
    
    # Verify the result
    assert user is not None
    assert user.id == 'test-user-id'
    assert user.email == 'test@example.com'
    assert user.displayName == 'Test User'
    assert user.settings.theme == 'light'
    assert user.settings.notifications is True
    
    # Verify the collection and document were called with correct arguments
    mock_firestore.return_value.collection.assert_called_once_with('users')
    mock_firestore.return_value.collection.return_value.document.assert_called_once_with('test-user-id')

@pytest.mark.asyncio
async def test_get_user_not_found(mock_firestore):
    """Test getting a non-existent user"""
    # Configure the document to not exist
    mock_doc = mock_firestore.return_value.collection.return_value.document.return_value.get.return_value
    mock_doc.exists = False
    
    # Create an instance of FirestoreClient and call get_user
    client = FirestoreClient()
    user = await client.get_user('nonexistent-user')
    
    # Verify the result is None
    assert user is None

@pytest.mark.asyncio
async def test_create_user(mock_firestore):
    """Test creating a user"""
    # Sample user data
    test_user_data = {
        'id': 'new-user-id',
        'email': 'new@example.com',
        'displayName': 'New User',
        'photoURL': 'https://example.com/new.jpg',
        'settings': {
            'theme': 'dark',
            'notifications': False
        }
    }
    
    # Create an instance of FirestoreClient and call create_user
    client = FirestoreClient()
    user = await client.create_user(test_user_data)
    
    # Verify the result
    assert user is not None
    assert user.id == 'new-user-id'
    assert user.email == 'new@example.com'
    assert user.displayName == 'New User'
    assert user.settings.theme == 'dark'
    assert user.settings.notifications is False
    
    # Verify set was called with the correct data
    mock_firestore.return_value.collection.return_value.document.return_value.set.assert_called_once()

@pytest.mark.asyncio
async def test_update_user(mock_firestore):
    """Test updating a user"""
    # Original user data
    original_user_data = {
        'id': 'update-user-id',
        'email': 'update@example.com',
        'displayName': 'Original Name',
        'photoURL': 'https://example.com/original.jpg',
        'createdAt': datetime.utcnow(),
        'lastLogin': datetime.utcnow(),
        'settings': {
            'theme': 'light',
            'notifications': True
        }
    }
    
    # Updated user data
    updated_user_data = dict(original_user_data)
    updated_user_data['displayName'] = 'Updated Name'
    
    # Configure the document to exist and return our test data
    mock_doc_ref = mock_firestore.return_value.collection.return_value.document.return_value
    mock_doc = mock_doc_ref.get.return_value
    mock_doc.exists = True
    
    # First call will get the original data, second call will get updated data
    mock_doc.to_dict.side_effect = [original_user_data, updated_user_data]
    
    # Create an instance of FirestoreClient and call update_user
    client = FirestoreClient()
    update_data = {'displayName': 'Updated Name'}
    user = await client.update_user('update-user-id', update_data)
    
    # Verify the result
    assert user is not None
    assert user.id == 'update-user-id'
    assert user.displayName == 'Updated Name'
    
    # Verify update was called with the correct data
    mock_doc_ref.update.assert_called_once_with(update_data)

@pytest.mark.asyncio
async def test_delete_user(mock_firestore):
    """Test deleting a user"""
    # Configure the document to exist
    mock_doc = mock_firestore.return_value.collection.return_value.document.return_value.get.return_value
    mock_doc.exists = True
    
    # Create an instance of FirestoreClient and call delete_user
    client = FirestoreClient()
    result = await client.delete_user('delete-user-id')
    
    # Verify the result is True (user was found and deleted)
    assert result is True
    
    # Verify delete was called
    mock_firestore.return_value.collection.return_value.document.return_value.delete.assert_called_once()

@pytest.mark.asyncio
async def test_delete_user_not_found(mock_firestore):
    """Test deleting a non-existent user"""
    # Configure the document to not exist
    mock_doc = mock_firestore.return_value.collection.return_value.document.return_value.get.return_value
    mock_doc.exists = False
    
    # Create an instance of FirestoreClient and call delete_user
    client = FirestoreClient()
    result = await client.delete_user('nonexistent-user')
    
    # Verify the result is False (user was not found)
    assert result is False
    
    # Verify delete was not called
    mock_firestore.return_value.collection.return_value.document.return_value.delete.assert_not_called() 