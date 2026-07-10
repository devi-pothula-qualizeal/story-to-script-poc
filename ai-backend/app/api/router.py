from fastapi import APIRouter

from app.api.routes import health, readiness, workflow

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(readiness.router, tags=["readiness"])
api_router.include_router(workflow.router, prefix="/workflow", tags=["workflow"])