from fastapi import APIRouter

from app.schemas.health import HealthResponse, get_health_response

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return get_health_response()
