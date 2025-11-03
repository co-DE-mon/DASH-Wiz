FROM python:3.11-slim
WORKDIR /app

# System deps (adjust if you need CUDA)
RUN apt-get update \
  && apt-get install -y --no-install-recommends git build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV MODEL_PATH=/app/models/natural-sql-7b
ENV HOST=0.0.0.0
ENV PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "uvicorn model_service:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]


