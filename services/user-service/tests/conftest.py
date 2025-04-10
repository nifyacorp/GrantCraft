"""Pytest configuration file for User Service tests"""
import os
import pytest
from unittest.mock import patch

@pytest.fixture(scope="session", autouse=True)
def mock_env_vars():
    """Mock environment variables for testing"""
    with patch.dict(os.environ, {
        "FIREBASE_PROJECT_ID": "test-project",
        "GOOGLE_APPLICATION_CREDENTIALS": "fake-credentials.json",
        "DEBUG": "true"
    }):
        yield

@pytest.fixture(scope="session", autouse=True)
def mock_firebase_admin():
    """Mock firebase_admin initialization"""
    with patch("firebase_admin.initialize_app"):
        with patch("firebase_admin.get_app", side_effect=ValueError):
            yield 