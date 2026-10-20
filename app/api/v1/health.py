from fastapi import APIRouter

from app.ml.inference import OncologyClassifier
from app.models.schemas import HealthResponse
from app.utils.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    settings = get_settings()
    try:
        clf = OncologyClassifier.get()
        model_loaded = clf.model is not None
        model_name = clf.model_name
    except Exception:
        model_loaded = False
        model_name = settings.ml_model_name

    return HealthResponse(
        status="healthy",
        service=settings.app_name,
        version=settings.app_version,
        model_loaded=model_loaded,
        model_name=model_name,
        gpu={"model": "NVIDIA T4", "utilization_pct": 0, "vram_used_gb": 0},
        database="connected" if settings.database_url else "unknown",
    )
