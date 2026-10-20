"""Build OncologyClassifier with 4-class head, mirroring app/ml/inference.py _build_model()."""
import torch.nn as nn
from torchvision import models
from torchvision.models import (
    DenseNet121_Weights,
    EfficientNet_B0_Weights,
    ResNet18_Weights,
)

NUM_CLASSES = 4

_BUILDERS = {
    "efficientnet_b0": (models.efficientnet_b0, EfficientNet_B0_Weights.IMAGENET1K_V1),
    "resnet18": (models.resnet18, ResNet18_Weights.IMAGENET1K_V1),
    "densenet121": (models.densenet121, DenseNet121_Weights.IMAGENET1K_V1),
}


def _in_features(model: nn.Module, name: str) -> int:
    if name.startswith("efficientnet"):
        return model.classifier[-1].in_features
    if name.startswith("resnet"):
        return model.fc.in_features
    if name.startswith("densenet"):
        return model.classifier.in_features
    return 1280


def build_model(name: str = "efficientnet_b0", num_classes: int = NUM_CLASSES) -> nn.Module:
    """Return ImageNet-pretrained model with num_classes output head."""
    builder, weights = _BUILDERS.get(name, _BUILDERS["efficientnet_b0"])
    model = builder(weights=weights)
    in_feat = _in_features(model, name)
    if hasattr(model, "classifier"):
        if isinstance(model.classifier, nn.Sequential):
            model.classifier[-1] = nn.Linear(in_feat, num_classes)
        else:
            model.classifier = nn.Linear(in_feat, num_classes)
    elif hasattr(model, "fc"):
        model.fc = nn.Linear(in_feat, num_classes)
    return model


def freeze_backbone(model: nn.Module, name: str) -> None:
    """Freeze all layers except the classification head."""
    head_names = {"efficientnet_b0": "classifier", "resnet18": "fc", "densenet121": "classifier"}
    head = head_names.get(name, "classifier")
    for param_name, param in model.named_parameters():
        if not param_name.startswith(head):
            param.requires_grad = False


def unfreeze_all(model: nn.Module) -> None:
    for param in model.parameters():
        param.requires_grad = True
