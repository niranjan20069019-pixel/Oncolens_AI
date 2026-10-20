import io
from typing import Tuple

import numpy as np
import torch
from PIL import Image
from torchvision import transforms

from app.ml.dicom_loader import load_dicom_to_pil
from app.utils.security import sniff_image_type

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
INPUT_SIZE = 224


def _detect_modality(filename: str, file_type: str | None) -> str:
    lower = filename.lower()
    if lower.endswith((".dcm", ".dicom")) or file_type == "dicom":
        return "DICOM"
    if any(k in lower for k in ("ct", "computed")):
        return "CT"
    if any(k in lower for k in ("mri", "mr_")):
        return "MRI"
    if any(k in lower for k in ("xray", "x-ray", "cxr", "chest")):
        return "XRAY"
    return "RASTER"


def bytes_to_pil(payload: bytes, filename: str) -> Tuple[Image.Image, str]:
    kind = sniff_image_type(payload)
    if kind == "dicom" or filename.lower().endswith((".dcm", ".dicom")):
        return load_dicom_to_pil(payload)
    img = Image.open(io.BytesIO(payload))
    if img.mode != "RGB":
        img = img.convert("RGB")
    modality = _detect_modality(filename, kind)
    return img, modality


def preprocess_for_model(payload: bytes, filename: str) -> Tuple[torch.Tensor, Image.Image, str]:
    pil_img, modality = bytes_to_pil(payload, filename)
    pil_img = _enhance_medical_contrast(pil_img)
    tensor = _build_transform()(pil_img)
    return tensor.unsqueeze(0), pil_img, modality


def _enhance_medical_contrast(img: Image.Image) -> Image.Image:
    arr = np.asarray(img).astype(np.float32)
    if arr.ndim == 2:
        arr = np.stack([arr, arr, arr], axis=-1)
    p_lo, p_hi = np.percentile(arr, (2, 98))
    if p_hi > p_lo:
        arr = np.clip((arr - p_lo) / (p_hi - p_lo) * 255.0, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), mode="RGB")


def _build_transform() -> transforms.Compose:
    return transforms.Compose(
        [
            transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ]
    )
