from fastapi import APIRouter

from app.api.v1 import auth, health, history, predict, websocket

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router, prefix="/v1")
api_router.include_router(predict.router, prefix="/v1")
api_router.include_router(history.router, prefix="/v1")
api_router.include_router(websocket.router, prefix="/v1")
