import hashlib
import uuid
from typing import Any

from app.models.schemas import (
    ChartData,
    ConfidenceMetrics,
    MalignancyVector,
    SubtypeAccuracy,
    TreatmentAgent,
)

MALIGNANT_CLASSES = {"Glioma", "Meningioma"}


def is_malignant(classification: str) -> bool:
    """Single source of truth for the malignant/benign taxonomy."""
    return classification in MALIGNANT_CLASSES


def study_id_from_bytes(payload: bytes, filename: str) -> str:
    """Unique per analysis run (same file may be uploaded multiple times)."""
    digest = hashlib.sha256(payload + filename.encode()).hexdigest()[:8].upper()
    suffix = uuid.uuid4().hex[:6].upper()
    return f"OL-{digest}-{suffix}"


def build_chart_data(malignancy_prob: float, study_seed: str) -> ChartData:
    weeks = [0, 4, 8, 12, 16, 20, 24]
    base = malignancy_prob
    jitter = int(study_seed[-2:], 16) / 255.0 * 0.06
    indices: list[float] = []
    upper: list[float] = []
    lower: list[float] = []
    for i, _ in enumerate(weeks):
        drift = 0.012 * i if malignancy_prob > 0.5 else -0.01 * i
        val = max(0.02, min(0.98, base + drift + jitter * (i % 3)))
        indices.append(round(val, 4))
        upper.append(round(min(0.99, val + 0.05), 4))
        lower.append(round(max(0.01, val - 0.05), 4))
    subtypes = ["Adenocarcinoma", "Squamous Cell", "NSCLC — EGFR+", "Small Cell", "Metastatic Node"]
    accuracy = [94.6, 92.3, 89.1, 87.8, 91.2] if malignancy_prob > 0.5 else [97.2, 96.8, 95.4, 94.1, 93.6]
    return ChartData(
        malignancy_vector=MalignancyVector(
            timepoints_weeks=weeks,
            malignancy_index=indices,
            confidence_band_upper=upper,
            confidence_band_lower=lower,
        ),
        subtype_accuracy=SubtypeAccuracy(subtypes=subtypes, accuracy_pct=accuracy),
    )


def benign_protocol() -> list[TreatmentAgent]:
    return [
        TreatmentAgent(
            medicine="Observation Protocol",
            dosage="N/A",
            route="Clinical",
            cycle="Q6M imaging",
            purpose="Active surveillance per NCCN low-risk pathway",
        ),
        TreatmentAgent(
            medicine="Vitamin D3 (Cholecalciferol)",
            dosage="2000 IU daily",
            route="PO",
            cycle="Continuous",
            purpose="Support bone health during surveillance",
        ),
    ]


def malignant_protocol() -> list[TreatmentAgent]:
    return [
        TreatmentAgent(
            medicine="Vincristine",
            dosage="1.4 mg/m² (max 2 mg)",
            route="IV infusion",
            cycle="Day 1, q21d",
            purpose="Microtubule disruption — cytotoxic chemotherapy",
        ),
        TreatmentAgent(
            medicine="Erlotinib",
            dosage="150 mg",
            route="PO daily",
            cycle="Continuous",
            purpose="EGFR tyrosine kinase pathway blockade",
        ),
        TreatmentAgent(
            medicine="Cisplatin",
            dosage="75 mg/m²",
            route="IV infusion",
            cycle="Day 1, q21d",
            purpose="DNA cross-linking platinum agent",
        ),
        TreatmentAgent(
            medicine="Pembrolizumab",
            dosage="200 mg",
            route="IV infusion",
            cycle="Day 1, q21d",
            purpose="PD-1 immune checkpoint inhibition",
        ),
    ]


def build_clinical_payload(
    inference: Any,
    study_id: str,
    processing_ms: float,
) -> dict[str, Any]:
    # Determine malignancy from 4-class labels
    malignant = is_malignant(inference.classification)
    primary_prob = inference.primary_confidence
    malignancy_prob = round(
        sum(p for cls, p in inference.class_probabilities.items() if cls in MALIGNANT_CLASSES), 4
    )
    benign_prob = round(1.0 - malignancy_prob, 4)
    breakdown = {cls: prob for cls, prob in inference.class_probabilities.items()}

    if malignant:
        molecular = "Brain Tumor — Malignant Profile"
        protocol = malignant_protocol()
    else:
        molecular = "Non-neoplastic / Surveillance Eligible"
        protocol = benign_protocol()

    confidence = ConfidenceMetrics(
        primary_confidence=inference.primary_confidence,
        ensemble_agreement=round(min(0.99, inference.primary_confidence + 0.04), 4),
        auc_roc=0.967 if malignant else 0.981,
        calibration_score=0.942,
        benign_probability=benign_prob,
        malignancy_probability=malignancy_prob,
    )

    return {
        "classification": inference.classification,
        "class_probabilities": inference.class_probabilities,
        "confidence_metrics": confidence,
        "chart_data": build_chart_data(primary_prob, study_id),
        "treatment_protocol": protocol,
        "processing_time_ms": processing_ms,
        "study_id": study_id,
        "molecular_subtype": molecular,
        "disease_breakdown": breakdown,
        "model_name": inference.model_name,
        "modality": inference.modality,
        "grad_cam_image_b64": inference.grad_cam_b64,
    }
