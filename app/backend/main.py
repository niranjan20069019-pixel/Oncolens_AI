"""Backward-compatible entrypoint for uvicorn app.backend.main:app"""

from app.main import app

__all__ = ["app"]
