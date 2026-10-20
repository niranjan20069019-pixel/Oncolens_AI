# OncoLens AI

Production-grade oncology imaging platform with **PyTorch** inference (EfficientNet/ResNet/DenseNet), **Grad-CAM** explainability, **DICOM** support, **JWT** auth, **PostgreSQL** persistence, and a **Streamlit** clinical dashboard.

## Quick start (local)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
./run.sh
```

- Dashboard: http://127.0.0.1:8501  
- API docs: http://127.0.0.1:8000/docs  

**Demo login:** `doctor@oncolens.ai` / `doctor123` · `admin@oncolens.ai` / `admin123`

## Docker

```bash
docker compose up --build
```

## Architecture

```
app/
├── api/          # FastAPI routes (auth, predict, history, websocket)
├── auth/         # JWT & role dependencies
├── database/     # SQLAlchemy models & CRUD
├── ml/           # Preprocessing, DICOM, inference, Grad-CAM
├── models/       # Pydantic schemas
├── services/     # Prediction, PDF reports, progress hub
├── utils/        # Config, logging, upload validation
└── main.py       # Application factory
```

## ML weights

Set `ML_WEIGHTS_PATH` to a fine-tuned `.pt` state dict for clinical deployment. Without custom weights, the platform runs **real forward-pass inference** using an ImageNet-pretrained backbone with an initialized binary head (requires validation before clinical use).

## Security

- CORS restricted via `ALLOWED_ORIGINS`
- JWT required for `/api/v1/predict`
- Upload size limits & magic-byte validation
- Rate limiting via SlowAPI
