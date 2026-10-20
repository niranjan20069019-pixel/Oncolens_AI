import json
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Patient, Report, Scan, User, UserRole


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    email: str,
    hashed_password: str,
    full_name: str,
    role: UserRole,
) -> User:
    user = User(email=email, hashed_password=hashed_password, full_name=full_name, role=role)
    db.add(user)
    await db.flush()
    return user


async def list_patients(db: AsyncSession, limit: int = 100) -> list[Patient]:
    result = await db.execute(select(Patient).order_by(Patient.created_at.desc()).limit(limit))
    return list(result.scalars().all())


async def create_patient(db: AsyncSession, mrn: str, full_name: str, created_by_id: int | None) -> Patient:
    patient = Patient(mrn=mrn, full_name=full_name, created_by_id=created_by_id)
    db.add(patient)
    await db.flush()
    return patient


async def save_scan_and_report(
    db: AsyncSession,
    scan_data: dict[str, Any],
    prediction: dict[str, Any],
    uploaded_by_id: int | None,
    patient_id: int | None = None,
) -> Scan:
    cm = prediction["confidence_metrics"]
    if hasattr(cm, "model_dump"):
        cm = cm.model_dump()
    malignancy = float(cm.get("malignancy_probability", 0.0))
    benign = float(cm.get("benign_probability", round(1.0 - malignancy, 4)))
    scan = Scan(
        study_id=prediction["study_id"],
        filename=scan_data["filename"],
        modality=scan_data.get("modality", "UNKNOWN"),
        patient_id=patient_id,
        uploaded_by_id=uploaded_by_id,
        classification=prediction["classification"],
        malignancy_probability=malignancy,
        benign_probability=benign,
        processing_time_ms=prediction["processing_time_ms"],
        model_name=prediction.get("model_name", "efficientnet_b0"),
    )
    db.add(scan)
    await db.flush()
    serializable = prediction.copy()
    if hasattr(serializable.get("confidence_metrics"), "model_dump"):
        serializable["confidence_metrics"] = serializable["confidence_metrics"].model_dump()
    if hasattr(serializable.get("chart_data"), "model_dump"):
        serializable["chart_data"] = serializable["chart_data"].model_dump()
    protocol = serializable.get("treatment_protocol") or []
    if protocol and hasattr(protocol[0], "model_dump"):
        serializable["treatment_protocol"] = [t.model_dump() for t in protocol]
    report = Report(scan_id=scan.id, summary_json=json.dumps(serializable, default=str))
    db.add(report)
    await db.flush()
    return scan


async def list_scan_history(
    db: AsyncSession, limit: int = 50, uploaded_by_id: int | None = None
) -> list[Scan]:
    stmt = select(Scan).order_by(Scan.created_at.desc()).limit(limit)
    if uploaded_by_id is not None:
        stmt = stmt.where(Scan.uploaded_by_id == uploaded_by_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())
