from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.router import api_router
from app.api.v1.predict import limiter
from app.database.session import get_session_factory, init_db
from app.ml.inference import OncologyClassifier
from app.services.seed import seed_default_users
from app.utils.config import get_settings
from app.utils.logging import get_logger, setup_logging

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    settings = get_settings()
    logger.info("Starting %s v%s [%s]", settings.app_name, settings.app_version, settings.oncolens_env)
    await init_db()
    async with get_session_factory()() as db:
        await seed_default_users(db)
        await db.commit()
    # Warm ML model
    try:
        OncologyClassifier.get()
    except Exception as exc:
        logger.error("Failed to load ML model: %s", exc)
    yield
    logger.info("Shutting down OncoLens AI")


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Production oncology AI platform — deep learning inference & clinical workflow",
        lifespan=lifespan,
    )
    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    application.add_middleware(SlowAPIMiddleware)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origin_list(),
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )
    application.include_router(api_router, prefix="/api")

    @application.get("/health")
    async def legacy_health():
        from app.api.v1.health import health

        return await health()

    @application.exception_handler(Exception)
    async def unhandled_exception(_request: Request, exc: Exception):
        logger.exception("Unhandled error: %s", exc)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    return application


app = create_app()
