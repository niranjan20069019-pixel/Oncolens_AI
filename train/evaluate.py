"""Evaluate saved weights on the test split; print classification report + save confusion matrix."""
import argparse
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import torch
from sklearn.metrics import classification_report, confusion_matrix

from train.dataset import CLASS_NAMES, BrainTumorDataset
from train.model_builder import build_model
from torch.utils.data import DataLoader


def evaluate(args: argparse.Namespace) -> None:
    device = torch.device(
        args.device if args.device != "auto"
        else ("cuda" if torch.cuda.is_available() else "cpu")
    )

    model = build_model(args.model)
    state = torch.load(args.weights, map_location="cpu", weights_only=True)
    model.load_state_dict(state, strict=False)
    model.to(device).eval()
    print(f"Loaded weights from {args.weights}")

    test_ds = BrainTumorDataset(args.data_dir, "test", augment=False)
    loader = DataLoader(test_ds, batch_size=args.batch_size, shuffle=False, num_workers=4)

    all_preds, all_labels = [], []
    with torch.no_grad():
        for imgs, labels in loader:
            preds = model(imgs.to(device)).argmax(dim=1).cpu().tolist()
            all_preds.extend(preds)
            all_labels.extend(labels.tolist())

    print("\n=== Classification Report ===")
    print(classification_report(all_labels, all_preds, target_names=CLASS_NAMES, digits=4))

    cm = confusion_matrix(all_labels, all_preds)
    fig, ax = plt.subplots(figsize=(7, 6))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES, ax=ax)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    ax.set_title("Confusion Matrix — Brain Tumor Test Set")
    plt.tight_layout()
    out_path = Path(args.output)
    fig.savefig(out_path, dpi=150)
    print(f"Confusion matrix saved → {out_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate OncologyClassifier on Brain Tumor test set")
    parser.add_argument("--data-dir", required=True, help="Path to dataset root")
    parser.add_argument("--weights", required=True, help="Path to .pt weights file")
    parser.add_argument("--model", default="efficientnet_b0", choices=["efficientnet_b0", "resnet18", "densenet121"])
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--output", default="confusion_matrix.png")
    parser.add_argument("--device", default="auto", choices=["auto", "cpu", "cuda"])
    args = parser.parse_args()
    evaluate(args)


if __name__ == "__main__":
    main()
