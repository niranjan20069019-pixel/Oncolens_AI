# OncologyClassifier — Brain Tumor Fine-Tuning

Fine-tunes the OncoLens `OncologyClassifier` on a 4-class Brain Tumor MRI dataset.

## 1. Dataset Setup

Extract the Roboflow dataset so the folder structure is:

```
Brain Tumor.v1i.folder/
  train/{glioma_tumor,meningioma_tumor,pituitary_tumor,no_tumor}/*.jpg
  valid/...
  test/...
```

Place the folder at the same level as `oncolens-ai/` (i.e. `~/Brain Tumor.v1i.folder/`).

## 2. Install Training Dependencies

```bash
cd oncolens-ai
source .venv/bin/activate
pip install scikit-learn>=1.4 matplotlib>=3.8 tqdm>=4.66 seaborn>=0.13
```

## 3. Training

```bash
# From oncolens-ai/ directory
python -m train.train \
  --data-dir "../Brain Tumor.v1i.folder" \
  --model efficientnet_b0 \
  --epochs 30 \
  --batch-size 32 \
  --freeze-epochs 3 \
  --output data/brain_tumor_weights.pt
```

Other backbone options: `resnet18`, `densenet121`.

## 4. Evaluation

```bash
python -m train.evaluate \
  --data-dir "../Brain Tumor.v1i.folder" \
  --weights data/brain_tumor_weights.pt \
  --output confusion_matrix.png
```

Prints a full `classification_report` and saves `confusion_matrix.png`.

## 5. Wire Weights into OncoLens App

Set the environment variable before starting the server:

```bash
export ML_WEIGHTS_PATH=data/brain_tumor_weights.pt
./run.sh
```

Or add to `.env`:

```
ML_WEIGHTS_PATH=data/brain_tumor_weights.pt
```

The app loads weights via `torch.load(path, weights_only=True)` → `load_state_dict(strict=False)`.

## 6. Expected Training Time

| Hardware | ~Time for 30 epochs |
|---|---|
| CPU (8-core) | 3–5 hours |
| GPU (RTX 3060) | 15–25 minutes |
| GPU (A100) | 5–8 minutes |

## 7. Classes

| Index | Label | Display Name |
|---|---|---|
| 0 | glioma_tumor | Glioma |
| 1 | meningioma_tumor | Meningioma |
| 2 | pituitary_tumor | Pituitary |
| 3 | no_tumor | No Tumor |

## 8. Binary Benign/Malignant Mapping (Optional)

If the clinical team needs binary output, map post-inference:

```python
BINARY_MAP = {
    "Glioma": "Malignant",
    "Meningioma": "Malignant",
    "Pituitary": "Benign",
    "No Tumor": "Benign",
}
binary_result = BINARY_MAP[result.classification]
```
