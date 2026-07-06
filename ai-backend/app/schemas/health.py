from pydantic import BaseModel

from app.core.config import get_settings


class HealthResponse(BaseModel):
    status: str
    app: str


def get_health_response() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(status="ok", app=settings.app_name)
