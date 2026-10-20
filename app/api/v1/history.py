from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_doctor
from app.database.crud import list_patients, list_scan_history
from app.database.models import User, UserRole
from app.database.session import get_db
from app.models.schemas import PatientOut, ScanHistoryItem

router = APIRouter(tags=["history"])


@router.get("/history/scans", response_model=list[ScanHistoryItem])
async def scan_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
) -> list[ScanHistoryItem]:
    scans = await list_scan_history(
        db, limit=limit, uploaded_by_id=user.id if user.role is UserRole.PATIENT else None
    )
    return [
        ScanHistoryItem(
            id=s.id,
            study_id=s.study_id,
            filename=s.filename,
            modality=s.modality,
            classification=s.classification,
            malignancy_probability=s.malignancy_probability,
            benign_probability=s.benign_probability,
            processing_time_ms=s.processing_time_ms,
            model_name=s.model_name,
            created_at=s.created_at.isoformat(),
        )
        for s in scans
    ]


@router.get("/patients", response_model=list[PatientOut])
async def patients(
    user: User = Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
) -> list[PatientOut]:
    rows = await list_patients(db)
    return [PatientOut.model_validate(p) for p in rows]
