from typing import Any

from pydantic import BaseModel, Field


class ConfidenceMetrics(BaseModel):
    primary_confidence: float = Field(ge=0.0, le=1.0)
    ensemble_agreement: float = Field(ge=0.0, le=1.0)
    auc_roc: float = Field(ge=0.0, le=1.0)
    calibration_score: float = Field(ge=0.0, le=1.0)
    benign_probability: float = Field(ge=0.0, le=1.0)
    malignancy_probability: float = Field(ge=0.0, le=1.0)


class MalignancyVector(BaseModel):
    timepoints_weeks: list[int]
    malignancy_index: list[float]
    confidence_band_upper: list[float]
    confidence_band_lower: list[float]


class SubtypeAccuracy(BaseModel):
    subtypes: list[str]
    accuracy_pct: list[float]


class ChartData(BaseModel):
    malignancy_vector: MalignancyVector
    subtype_accuracy: SubtypeAccuracy


class TreatmentAgent(BaseModel):
    medicine: str
    dosage: str
    route: str
    cycle: str
    purpose: str


class PredictionResponse(BaseModel):
    classification: str
    class_probabilities: dict[str, float] = Field(default_factory=dict)
    confidence_metrics: ConfidenceMetrics
    chart_data: ChartData
    treatment_protocol: list[TreatmentAgent]
    processing_time_ms: float
    study_id: str
    molecular_subtype: str
    disease_breakdown: dict[str, float]
    model_name: str = "efficientnet_b0"
    modality: str = "UNKNOWN"
    grad_cam_image_b64: str | None = None
    job_id: str | None = None
    scan_db_id: int | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    email: str


class LoginRequest(BaseModel):
    email: str
    password: str


class PatientCreate(BaseModel):
    mrn: str
    full_name: str
    date_of_birth: str | None = None


class PatientOut(BaseModel):
    id: int
    mrn: str
    full_name: str
    date_of_birth: str | None = None

    model_config = {"from_attributes": True}


class ScanHistoryItem(BaseModel):
    id: int
    study_id: str
    filename: str
    modality: str
    classification: str
    malignancy_probability: float
    benign_probability: float
    processing_time_ms: float
    model_name: str
    created_at: str

    model_config = {"from_attributes": True}


class ProgressMessage(BaseModel):
    job_id: str
    stage: str
    percent: int
    message: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model_loaded: bool
    model_name: str
    gpu: dict[str, Any]
    database: str
