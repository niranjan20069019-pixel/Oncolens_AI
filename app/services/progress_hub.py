import asyncio
import uuid
from typing import Any

from app.models.schemas import ProgressMessage


class ProgressHub:
    def __init__(self) -> None:
        self._channels: dict[str, asyncio.Queue] = {}

    def create_job(self) -> str:
        job_id = uuid.uuid4().hex[:16]
        self._channels[job_id] = asyncio.Queue()
        return job_id

    async def emit(self, job_id: str, stage: str, percent: int, message: str) -> None:
        if job_id not in self._channels:
            self._channels[job_id] = asyncio.Queue()
        await self._channels[job_id].put(
            ProgressMessage(job_id=job_id, stage=stage, percent=percent, message=message)
        )

    async def stream(self, job_id: str):
        queue = self._channels.setdefault(job_id, asyncio.Queue())
        try:
            while True:
                msg: ProgressMessage = await asyncio.wait_for(queue.get(), timeout=120.0)
                yield msg
                if msg.percent >= 100:
                    break
        finally:
            self._channels.pop(job_id, None)

    def close(self, job_id: str) -> None:
        self._channels.pop(job_id, None)


progress_hub = ProgressHub()
