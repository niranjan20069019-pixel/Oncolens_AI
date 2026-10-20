import io
from typing import Tuple

import numpy as np
from PIL import Image

try:
    import pydicom
    from pydicom.pixel_data_handlers.util import apply_modality_lut
except ImportError:  # pragma: no cover
    pydicom = None


def load_dicom_to_pil(payload: bytes) -> Tuple[Image.Image, str]:
    if pydicom is None:
        raise ValueError("pydicom is not installed")
    ds = pydicom.dcmread(io.BytesIO(payload), force=True)
    modality = getattr(ds, "Modality", "UNKNOWN")
    arr = ds.pixel_array.astype(np.float32)
    try:
        arr = apply_modality_lut(arr, ds)
    except Exception:
        pass
    arr = _window_normalize(arr)
    rgb = np.stack([arr, arr, arr], axis=-1).astype(np.uint8)
    return Image.fromarray(rgb, mode="RGB"), modality


def _window_normalize(arr: np.ndarray) -> np.ndarray:
    lo, hi = np.percentile(arr, [1, 99])
    if hi <= lo:
        lo, hi = float(arr.min()), float(arr.max())
    if hi <= lo:
        return np.zeros_like(arr, dtype=np.uint8)
    clipped = np.clip(arr, lo, hi)
    norm = (clipped - lo) / (hi - lo)
    return (norm * 255).astype(np.uint8)
