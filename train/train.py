"""Main training script for OncologyClassifier on Brain Tumor 4-class dataset."""
import argparse
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import f1_score
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from tqdm import tqdm

from train.dataset import CLASS_NAMES, get_dataloaders
from train.model_builder import build_model, freeze_backbone, unfreeze_all


def compute_class_weights(data_dir: str, device: torch.device) -> torch.Tensor:
    from train.dataset import BrainTumorDataset, CLASS_TO_IDX
    ds = BrainTumorDataset(data_dir, "train", augment=False)
    labels = [lbl for _, lbl in ds.samples]
    counts = np.bincount(labels, minlength=len(CLASS_NAMES)).astype(float)
    weights = counts.sum() / (len(CLASS_NAMES) * counts)
    return torch.tensor(weights, dtype=torch.float).to(device)


def evaluate(model: nn.Module, loader, criterion, device: torch.device):
    model.eval()
    total_loss, correct, all_preds, all_labels = 0.0, 0, [], []
    with torch.no_grad():
        for imgs, labels in loader:
            imgs, labels = imgs.to(device), labels.to(device)
            logits = model(imgs)
            total_loss += criterion(logits, labels).item() * len(labels)
            preds = logits.argmax(dim=1)
            correct += (preds == labels).sum().item()
            all_preds.extend(preds.cpu().tolist())
            all_labels.extend(labels.cpu().tolist())
    n = len(loader.dataset)
    macro_f1 = f1_score(all_labels, all_preds, average="macro", zero_division=0)
    per_class_f1 = f1_score(all_labels, all_preds, average=None, zero_division=0)
    return total_loss / n, correct / n, macro_f1, per_class_f1


def train(args: argparse.Namespace) -> None:
    device = torch.device(
        args.device if args.device != "auto"
        else ("cuda" if torch.cuda.is_available() else "cpu")
    )
    print(f"Using device: {device}")

    train_loader, val_loader, _ = get_dataloaders(args.data_dir, args.batch_size)
    model = build_model(args.model).to(device)
    freeze_backbone(model, args.model)

    class_weights = compute_class_weights(args.data_dir, device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=args.lr)
    scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    best_f1, best_epoch = 0.0, 0

    for epoch in range(1, args.epochs + 1):
        if epoch == args.freeze_epochs + 1:
            print("Unfreezing backbone...")
            unfreeze_all(model)
            optimizer = AdamW(model.parameters(), lr=args.lr * 0.1)
            scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs - epoch + 1)

        model.train()
        running_loss, correct, total = 0.0, 0, 0
        pbar = tqdm(train_loader, desc=f"Epoch {epoch}/{args.epochs}", leave=False)
        for imgs, labels in pbar:
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            logits = model(imgs)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * len(labels)
            correct += (logits.argmax(1) == labels).sum().item()
            total += len(labels)
            pbar.set_postfix(loss=f"{running_loss/total:.4f}", acc=f"{correct/total:.4f}")

        scheduler.step()

        val_loss, val_acc, val_f1, per_cls_f1 = evaluate(model, val_loader, criterion, device)
        per_cls_str = " | ".join(f"{CLASS_NAMES[i][:8]}={per_cls_f1[i]:.3f}" for i in range(len(CLASS_NAMES)))
        print(
            f"Epoch {epoch:3d} | train_loss={running_loss/total:.4f} acc={correct/total:.4f} "
            f"| val_loss={val_loss:.4f} acc={val_acc:.4f} macro_f1={val_f1:.4f} | {per_cls_str}"
        )

        if val_f1 > best_f1:
            best_f1, best_epoch = val_f1, epoch
            torch.save(model.state_dict(), output_path)
            print(f"  ✓ Saved best checkpoint (macro_f1={best_f1:.4f}) → {output_path}")

    print(f"\nTraining complete. Best macro F1={best_f1:.4f} at epoch {best_epoch}.")
    print(f"Weights saved to: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Fine-tune OncologyClassifier on Brain Tumor dataset")
    parser.add_argument("--data-dir", required=True, help="Path to dataset root")
    parser.add_argument("--model", default="efficientnet_b0", choices=["efficientnet_b0", "resnet18", "densenet121"])
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--freeze-epochs", type=int, default=3)
    parser.add_argument("--output", default="data/brain_tumor_weights.pt")
    parser.add_argument("--device", default="auto", choices=["auto", "cpu", "cuda"])
    args = parser.parse_args()
    train(args)


if __name__ == "__main__":
    main()
