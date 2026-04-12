"""CADai Backend — FastAPI Application"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import get_settings
from src.routers import agent, health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered 3D CAD platform backend",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(agent.router, prefix="/api/agent", tags=["agent"])


@app.on_event("startup")
async def startup():
    logger.info(f"{settings.app_name} v{settings.app_version} starting...")
    logger.info(f"CORS allowed: {settings.frontend_url}")
    logger.info(f"LLM model: {settings.gemini_model}")
