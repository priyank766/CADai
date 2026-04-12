"""Health check router."""

from fastapi import APIRouter
from src.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health_check():
    """Returns service health status."""
    return {
        "status": "ok",
        "version": settings.app_version,
        "service": settings.app_name,
    }
