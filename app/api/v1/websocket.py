import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.progress_hub import progress_hub

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/progress/{job_id}")
async def progress_ws(websocket: WebSocket, job_id: str) -> None:
    await websocket.accept()
    try:
        async for msg in progress_hub.stream(job_id):
            await websocket.send_text(msg.model_dump_json())
    except WebSocketDisconnect:
        progress_hub.close(job_id)
    except Exception as exc:
        await websocket.send_text(json.dumps({"error": str(exc)}))
        progress_hub.close(job_id)
