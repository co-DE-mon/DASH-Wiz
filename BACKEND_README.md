# DASH-Wiz Backend (FastAPI + Natural-SQL)

## Run locally
```bash
python -m venv .venv && . .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
export MODEL_PATH=models/natural-sql-7b  # Windows: set MODEL_PATH=models/natural-sql-7b
uvicorn model_service:app --host 0.0.0.0 --port 8000 --workers 1
```

- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Environment
- HOST: 0.0.0.0
- PORT: 8000
- MODEL_PATH: models/natural-sql-7b (local dir) or HF repo id like `chatdb/natural-sql-7b`
- CORS_ORIGINS: comma-separated list (default http://localhost:5173)
- LOG_LEVEL: info | debug | warning

## Endpoints
- GET `/` – service info
- GET `/health` – readiness
- POST `/generate-sql` – body: `{ db_schema: string, question: string }`

## Notes
- First request warms the model (5–15s). Subsequent requests are faster.
- If `MODEL_PATH` doesn’t exist, the service will attempt to download `chatdb/natural-sql-7b` into `models/natural-sql-7b/`.

## Docker (prod)
See `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, and `Caddyfile`.


