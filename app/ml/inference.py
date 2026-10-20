import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Tuple

import torch
import torch.nn as nn
from torchvision import models

from app.ml.gradcam import generate_gradcam
from app.ml.preprocessor import preprocess_for_model
from app.utils.config import get_settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

CLASS_LABELS = ["Glioma", "Meningioma", "Pituitary", "No Tumor"]


@dataclass
class InferenceResult:
    classification: str
    primary_confidence: float
    class_probabilities: dict
    model_name: str
    modality: str
    grad_cam_b64: str
    logits: torch.Tensor


class OncologyClassifier:
    _instance = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        settings = get_settings()
        self.device = torch.device(
            settings.ml_device if torch.cuda.is_available() or settings.ml_device == "cpu" else "cpu"
        )
        self.model_name = settings.ml_model_name
        self.model = self._build_model(self.model_name)
        self._load_weights(settings.ml_weights_path)
        self.model.to(self.device)
        self.model.eval()
        logger.info("Loaded ML model %s on %s", self.model_name, self.device)

    @classmethod
    def get(cls) -> "OncologyClassifier":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def _build_model(self, name: str) -> nn.Module:
        builders = {
            "efficientnet_b0": models.efficientnet_b0,
            "resnet18": models.resnet18,
            "densenet121": models.densenet121,
        }
        builder = builders.get(name, models.efficientnet_b0)
        weights = None
        try:
            from torchvision.models import EfficientNet_B0_Weights, ResNet18_Weights, DenseNet121_Weights

            weight_enums = {
                "efficientnet_b0": EfficientNet_B0_Weights.IMAGENET1K_V1,
                "resnet18": ResNet18_Weights.IMAGENET1K_V1,
                "densenet121": DenseNet121_Weights.IMAGENET1K_V1,
            }
            weights = weight_enums.get(name, EfficientNet_B0_Weights.IMAGENET1K_V1)
        except Exception:
            weights = "IMAGENET1K_V1"
        model = builder(weights=weights)
        in_features = self._classifier_in_features(model, name)
        if hasattr(model, "classifier"):
            if isinstance(model.classifier, nn.Sequential):
                model.classifier[-1] = nn.Linear(in_features, 4)
            else:
                model.classifier = nn.Linear(in_features, 4)
        elif hasattr(model, "fc"):
            model.fc = nn.Linear(in_features, 4)
        return model

    @staticmethod
    def _classifier_in_features(model: nn.Module, name: str) -> int:
        if name.startswith("efficientnet"):
            return model.classifier[-1].in_features
        if name.startswith("resnet"):
            return model.fc.in_features
        if name.startswith("densenet"):
            return model.classifier.in_features
        return 1280

    def _load_weights(self, path: str) -> None:
        if path and Path(path).is_file():
            state = torch.load(path, map_location="cpu", weights_only=True)
            self.model.load_state_dict(state, strict=False)
            logger.info("Loaded custom weights from %s", path)
        else:
            logger.warning(
                "No custom oncology weights at %s — using ImageNet backbone with initialized head. "
                "Deploy fine-tuned weights via ML_WEIGHTS_PATH for clinical validation.",
                path or "(unset)",
            )

    def predict(self, payload: bytes, filename: str) -> InferenceResult:
        tensor, pil_img, modality = preprocess_for_model(payload, filename)
        tensor = tensor.to(self.device)
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1).squeeze(0).cpu()
        target_idx = int(probs.argmax().item())
        classification = CLASS_LABELS[target_idx]
        primary = float(probs[target_idx].item())
        class_probabilities = {CLASS_LABELS[i]: round(float(probs[i].item()), 4) for i in range(len(CLASS_LABELS))}

        grad_b64, _ = generate_gradcam(self.model, tensor, target_idx, pil_img)

        return InferenceResult(
            classification=classification,
            primary_confidence=round(primary, 4),
            class_probabilities=class_probabilities,
            model_name=self.model_name,
            modality=modality,
            grad_cam_b64=grad_b64,
            logits=logits,
        )


def run_inference(payload: bytes, filename: str) -> InferenceResult:
    return OncologyClassifier.get().predict(payload, filename)
