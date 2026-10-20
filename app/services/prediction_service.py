import time
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.crud import save_scan_and_report
from app.database.models import User
from app.ml.inference import run_inference
from app.models.schemas import PredictionResponse
from app.services.analytics import build_clinical_payload, study_id_from_bytes
from app.services.progress_hub import progress_hub
from app.utils.logging import get_logger

logger = get_logger(__name__)


async def run_prediction_pipeline(
    payload: bytes,
    filename: str,
    user: User | None,
    db: AsyncSession,
    job_id: str | None = None,
    patient_id: int | None = None,
) -> PredictionResponse:
    if job_id:
        await progress_hub.emit(job_id, "validate", 10, "Validating imaging payload")

    started = time.perf_counter()

    if job_id:
        await progress_hub.emit(job_id, "preprocess", 25, "Preprocessing CT/MRI/X-ray/DICOM")

    study_id = study_id_from_bytes(payload, filename)

    if job_id:
        await progress_hub.emit(job_id, "inference", 55, "Running deep learning inference")

    inference = run_inference(payload, filename)

    if job_id:
        await progress_hub.emit(job_id, "gradcam", 75, "Generating Grad-CAM explainability map")

    elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
    clinical = build_clinical_payload(inference, study_id, elapsed_ms)
    clinical["job_id"] = job_id

    if job_id:
        await progress_hub.emit(job_id, "persist", 90, "Persisting scan and report to database")

    scan = await save_scan_and_report(
        db,
        {"filename": filename, "modality": inference.modality},
        clinical,
        uploaded_by_id=user.id if user else None,
        patient_id=patient_id,
    )
    clinical["scan_db_id"] = scan.id

    if job_id:
        await progress_hub.emit(job_id, "complete", 100, "Analysis complete")

    logger.info(
        "Prediction complete study=%s class=%s model=%s ms=%.1f",
        study_id,
        clinical["classification"],
        inference.model_name,
        elapsed_ms,
    )
    return PredictionResponse.model_validate(clinical)
