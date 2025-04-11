# API Gateway package
"""
The API Gateway app package.
This module serves as the entry point for the API Gateway service.
"""
# Package-level exports to make imports cleaner
from .auth import verify_token, get_current_user 