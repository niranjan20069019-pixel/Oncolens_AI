import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import Response
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database.models import User
from app.database.session import get_db
from app.models.schemas import PredictionResponse
from app.services.prediction_service import run_prediction_pipeline
from app.services.progress_hub import progress_hub
from app.services.report_service import build_pdf_report
from app.utils.config import get_settings
from app.utils.security import extension_allowed, sniff_image_type

router = APIRouter(tags=["predict"])
limiter = Limiter(key_func=get_remote_address)


async def _read_and_validate_upload(image: UploadFile) -> tuple[bytes, str]:
    settings = get_settings()
    filename = image.filename or "study.dcm"
    if not extension_allowed(filename):
        raise HTTPException(status_code=400, detail="Unsupported file extension")
    payload = await image.read()
    if not payload:
        raise HTTPException(status_code=400, detail="Empty imaging payload")
    if len(payload) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum size of {settings.max_upload_bytes} bytes",
        )
    if sniff_image_type(payload) is None and not filename.lower().endswith((".dcm", ".dicom")):
        raise HTTPException(status_code=400, detail="Unrecognized or invalid image format")
    return payload, filename


@router.post("/predict", response_model=PredictionResponse)
@limiter.limit(lambda: get_settings().rate_limit)
async def predict(
    request: Request,
    image: UploadFile = File(...),
    patient_id: int | None = Form(None),
    job_id: str | None = Form(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PredictionResponse:
    payload, filename = await _read_and_validate_upload(image)
    if not job_id:
        job_id = progress_hub.create_job()
    try:
        return await run_prediction_pipeline(
            payload, filename, user, db, job_id=job_id, patient_id=patient_id
        )
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A study with this identifier already exists. Please retry the analysis.",
        ) from exc
    except Exception as exc:
        await db.rollback()
        from app.utils.logging import get_logger

        get_logger(__name__).exception("Predict failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc


@router.post("/predict/jobs")
async def create_prediction_job(user: User = Depends(get_current_user)) -> dict:
    job_id = progress_hub.create_job()
    return {"job_id": job_id}


@router.get("/reports/{study_id}/pdf")
async def download_pdf_report(
    study_id: str,
    clinician_note: str = "",
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select

    from app.database.models import Report, Scan

    result = await db.execute(select(Scan).where(Scan.study_id == study_id))
    scan = result.scalar_one_or_none()
    if scan is None:
        raise HTTPException(status_code=404, detail="Study not found")
    rep = await db.execute(select(Report).where(Report.scan_id == scan.id))
    report = rep.scalar_one_or_none()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    prediction = json.loads(report.summary_json)
    pdf_bytes = build_pdf_report(prediction, scan.filename, clinician_note)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="oncolens_{study_id}.pdf"'},
    )
