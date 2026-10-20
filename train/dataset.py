"""BrainTumorDataset with WeightedRandomSampler for class-imbalance handling."""
from pathlib import Path
from typing import Tuple

import numpy as np
import torch
from PIL import Image
from torch.utils.data import DataLoader, Dataset, WeightedRandomSampler
from torchvision import transforms

CLASS_NAMES = ["glioma_tumor", "meningioma_tumor", "pituitary_tumor", "no_tumor"]
CLASS_TO_IDX = {c: i for i, c in enumerate(CLASS_NAMES)}

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def _enhance_contrast(img: Image.Image) -> Image.Image:
    """Replicate app/ml/preprocessor.py _enhance_medical_contrast()."""
    arr = np.asarray(img).astype(np.float32)
    if arr.ndim == 2:
        arr = np.stack([arr, arr, arr], axis=-1)
    p_lo, p_hi = np.percentile(arr, (2, 98))
    if p_hi > p_lo:
        arr = np.clip((arr - p_lo) / (p_hi - p_lo) * 255.0, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), mode="RGB")


def _base_transform() -> transforms.Compose:
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


def _train_transform() -> transforms.Compose:
    return transforms.Compose([
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


class BrainTumorDataset(Dataset):
    def __init__(self, root: str, split: str, augment: bool = False) -> None:
        self.augment = augment
        self.transform = _train_transform() if augment else _base_transform()
        self.samples: list[Tuple[Path, int]] = []

        split_dir = Path(root) / split
        for cls_name, idx in CLASS_TO_IDX.items():
            cls_dir = split_dir / cls_name
            if not cls_dir.exists():
                continue
            for img_path in cls_dir.glob("*.jpg"):
                self.samples.append((img_path, idx))

        if not self.samples:
            raise FileNotFoundError(f"No images found in {split_dir}")

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        path, label = self.samples[idx]
        img = Image.open(path)
        if img.mode != "RGB":
            img = img.convert("RGB")
        img = _enhance_contrast(img)
        return self.transform(img), label


def get_dataloaders(
    data_dir: str,
    batch_size: int = 32,
    num_workers: int = 4,
) -> Tuple[DataLoader, DataLoader, DataLoader]:
    train_ds = BrainTumorDataset(data_dir, "train", augment=True)
    val_ds = BrainTumorDataset(data_dir, "valid", augment=False)
    test_ds = BrainTumorDataset(data_dir, "test", augment=False)

    # WeightedRandomSampler to handle class imbalance
    labels = [lbl for _, lbl in train_ds.samples]
    class_counts = np.bincount(labels, minlength=len(CLASS_NAMES)).astype(float)
    weights = 1.0 / class_counts
    sample_weights = torch.tensor([weights[lbl] for lbl in labels], dtype=torch.float)
    sampler = WeightedRandomSampler(sample_weights, num_samples=len(sample_weights), replacement=True)

    train_loader = DataLoader(train_ds, batch_size=batch_size, sampler=sampler, num_workers=num_workers)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)

    return train_loader, val_loader, test_loader
