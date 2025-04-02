"""API for checking project status."""
from fastapi import APIRouter

from reworkd_platform.web.api.monitoring.views import router as health_router
from reworkd_platform.web.api.monitoring.database_check import router as db_router

# Create a combined router
router = APIRouter()
router.include_router(health_router)
router.include_router(db_router)

__all__ = ["router"]
