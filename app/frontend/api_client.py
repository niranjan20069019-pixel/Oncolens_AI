import json
import os
import threading
from typing import Any, Callable

import requests

API_BASE = os.getenv("ONCOLENS_API_URL", "http://127.0.0.1:8000").rstrip("/")


class APIClient:
    def __init__(self) -> None:
        self.token: str | None = None

    def _headers(self) -> dict[str, str]:
        h = {"Accept": "application/json"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h

    def login(self, email: str, password: str) -> dict[str, Any]:
        r = requests.post(
            f"{API_BASE}/api/v1/auth/login",
            json={"email": email, "password": password},
            timeout=15,
        )
        r.raise_for_status()
        data = r.json()
        self.token = data["access_token"]
        return data

    def register(self, email: str, password: str, full_name: str, role: str = "doctor") -> dict[str, Any]:
        r = requests.post(
            f"{API_BASE}/api/v1/auth/register",
            params={"full_name": full_name, "role": role},
            json={"email": email, "password": password},
            headers=self._headers(),
            timeout=15,
        )
        if r.status_code == 401:
            raise PermissionError("Registration requires admin privileges. Contact your administrator.")
        r.raise_for_status()
        data = r.json()
        self.token = data["access_token"]
        return data

    def health(self) -> dict[str, Any]:
        r = requests.get(f"{API_BASE}/health", timeout=5)
        r.raise_for_status()
        return r.json()

    def create_job(self) -> str:
        r = requests.post(f"{API_BASE}/api/v1/predict/jobs", headers=self._headers(), timeout=10)
        r.raise_for_status()
        return r.json()["job_id"]

    def predict(
        self,
        filename: str,
        content: bytes,
        content_type: str,
        job_id: str | None = None,
        on_progress: Callable[[dict], None] | None = None,
    ) -> dict[str, Any]:
        if job_id is None:
            job_id = self.create_job()

        if on_progress:
            ws_thread = threading.Thread(
                target=self._consume_ws,
                args=(job_id, on_progress),
                daemon=True,
            )
            ws_thread.start()

        files = {"image": (filename, content, content_type)}
        data = {"job_id": job_id}
        r = requests.post(
            f"{API_BASE}/api/v1/predict",
            headers=self._headers(),
            files=files,
            data=data,
            timeout=180,
        )
        r.raise_for_status()
        return r.json()

    def _consume_ws(self, job_id: str, callback: Callable[[dict], None]) -> None:
        try:
            import websocket

            ws_url = API_BASE.replace("http://", "ws://").replace("https://", "wss://")
            ws = websocket.create_connection(f"{ws_url}/api/v1/ws/progress/{job_id}", timeout=120)
            while True:
                raw = ws.recv()
                if not raw:
                    break
                callback(json.loads(raw))
                msg = json.loads(raw)
                if msg.get("percent", 0) >= 100:
                    break
            ws.close()
        except Exception:
            pass

    def history(self, limit: int = 50) -> list[dict]:
        r = requests.get(
            f"{API_BASE}/api/v1/history/scans",
            headers=self._headers(),
            params={"limit": limit},
            timeout=15,
        )
        r.raise_for_status()
        return r.json()

    def download_pdf(self, study_id: str, note: str = "") -> bytes:
        r = requests.get(
            f"{API_BASE}/api/v1/reports/{study_id}/pdf",
            headers=self._headers(),
            params={"clinician_note": note},
            timeout=60,
        )
        r.raise_for_status()
        return r.content
