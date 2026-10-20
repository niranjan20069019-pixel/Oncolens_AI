#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [[ -d ".venv" ]]; then
  # shellcheck source=/dev/null
  source ".venv/bin/activate"
fi

export PYTHONPATH="${ROOT_DIR}:${PYTHONPATH:-}"
export ONCOLENS_API_URL="${ONCOLENS_API_URL:-http://127.0.0.1:8000}"
mkdir -p "${ROOT_DIR}/data"

if [[ -f "${ROOT_DIR}/.env" ]]; then
  set +e
  set -a
  # shellcheck source=/dev/null
  source "${ROOT_DIR}/.env"
  set +a
  set -e
fi
export STREAMLIT_SERVER_HEADLESS=true
export STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

API_PORT="${ONCOLENS_API_PORT:-8000}"
UI_PORT="${ONCOLENS_UI_PORT:-8501}"

port_pids() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti:"${port}" -sTCP:LISTEN 2>/dev/null || true
  elif command -v fuser >/dev/null 2>&1; then
    fuser -n tcp "${port}" 2>/dev/null | tr -s ' ' '\n' || true
  fi
}

free_port() {
  local port="$1"
  local label="$2"
  local pids
  pids="$(port_pids "${port}")"
  if [[ -z "${pids}" ]]; then
    return 0
  fi
  echo "Port ${port} (${label}) is in use by PID(s): ${pids//$'\n'/ }. Stopping stale process(es)…"
  # shellcheck disable=SC2086
  kill ${pids} 2>/dev/null || true
  sleep 1
  pids="$(port_pids "${port}")"
  if [[ -n "${pids}" ]]; then
    echo "Port ${port} still busy; force-stopping…"
    # shellcheck disable=SC2086
    kill -9 ${pids} 2>/dev/null || true
    sleep 0.5
  fi
  if [[ -n "$(port_pids "${port}")" ]]; then
    echo "ERROR: Could not free port ${port}. Stop the process manually and retry."
    exit 1
  fi
}

UVICORN_PID=""
STREAMLIT_PID=""

cleanup() {
  echo ""
  echo "Shutting down OncoLens AI services…"
  [[ -n "${STREAMLIT_PID}" ]] && kill "${STREAMLIT_PID}" 2>/dev/null || true
  [[ -n "${UVICORN_PID}" ]] && kill "${UVICORN_PID}" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

free_port "${API_PORT}" "FastAPI"
free_port "${UI_PORT}" "Streamlit"

echo "Starting OncoLens AI FastAPI backend on http://127.0.0.1:${API_PORT}"
uvicorn app.main:app --host 0.0.0.0 --port "${API_PORT}" &
UVICORN_PID=$!

# Brief pause so the API binds before Streamlit health checks run.
sleep 1

echo "Starting OncoLens AI Streamlit dashboard on http://127.0.0.1:${UI_PORT}"
streamlit run app/frontend/dashboard.py \
  --server.port "${UI_PORT}" \
  --server.address 0.0.0.0 \
  --server.headless true \
  --browser.gatherUsageStats false &
STREAMLIT_PID=$!

echo ""
echo "OncoLens AI is running."
echo "  API:       http://127.0.0.1:${API_PORT}/docs"
echo "  Dashboard: http://127.0.0.1:${UI_PORT}"
echo "Press Ctrl+C to stop both services."
echo ""

wait
