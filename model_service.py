from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
from transformers import BitsAndBytesConfig
import torch
import logging
from datetime import datetime
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from huggingface_hub import snapshot_download
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Natural-SQL Model Service",
    version="1.0",
    description="Backend service for generating SQL queries from natural language"
)

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.getLogger().setLevel(LOG_LEVEL)

# Resolve CORS origins from env (comma-separated)
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173")
allow_origin_list = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("🚀 DASH-Wiz Backend Service Starting...")

PROVIDER = os.getenv("PROVIDER", "local").lower()  # local | remote_http | replicate

# Provider: local model setup
tokenizer = None
model = None
device = "none"
resolved_model_path = ""

if PROVIDER == "local":
    logger.info("⚙️  Provider: local model")
    logger.info("⚙️  Configuring 4-bit quantization…")
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16
    )

    # MODEL_PATH can be a local directory or a Hugging Face repo id
    MODEL_PATH = os.getenv("MODEL_PATH", "models/natural-sql-7b")

    def ensure_model_present(model_path: str) -> str:
        path_obj = Path(model_path)
        if path_obj.exists() and any(path_obj.iterdir()):
            logger.info(f"📦 Using local model at: {path_obj}")
            return str(path_obj)
        repo_id = model_path if "/" in model_path else "chatdb/natural-sql-7b"
        local_dir = Path("models") / "natural-sql-7b"
        try:
            logger.info(f"⬇️  Downloading model from HF Hub: {repo_id} → {local_dir}")
            snapshot_download(repo_id=repo_id, local_dir=str(local_dir))
            return str(local_dir)
        except Exception as dl_err:
            logger.error(f"❌ Could not download model: {dl_err}")
            raise

    resolved_model_path = ensure_model_present(MODEL_PATH)
    logger.info(f"📦 Loading Natural-SQL model from: {resolved_model_path}")

    try:
        tokenizer = AutoTokenizer.from_pretrained(resolved_model_path)
        logger.info("✅ Tokenizer loaded successfully")

        if tokenizer.pad_token is None and tokenizer.eos_token is not None:
            tokenizer.pad_token = tokenizer.eos_token

        if torch.cuda.is_available():
            model = AutoModelForCausalLM.from_pretrained(
                resolved_model_path,
                quantization_config=bnb_config,
                device_map="auto"
            )
            device = "cuda"
        else:
            logger.info("🖥️  CUDA not available; loading model on CPU without 4-bit quantization")
            model = AutoModelForCausalLM.from_pretrained(
                resolved_model_path,
                device_map=None,
                torch_dtype=torch.float32
            )
            device = "cpu"

        logger.info("✅ Model loaded successfully")
        try:
            model = torch.compile(model)
            logger.info("✅ Model compiled with torch.compile()")
        except Exception as compile_err:
            logger.warning(f"⚠️  torch.compile not applied: {compile_err}")

        logger.info(f"🎯 Model ready on device: {device.upper()}")
        logger.info("=" * 60)
    except Exception as e:
        logger.error(f"❌ Failed to load model: {str(e)}")
        raise
else:
    # Remote providers do not load local model
    device = "remote"
    logger.info(f"⚙️  Provider: {PROVIDER} (no local model will be loaded)")


# -------- Request & Response Schemas --------
class QueryRequest(BaseModel):
    db_schema: str
    question: str

class QueryResponse(BaseModel):
    sql_query: str
    columns: List[str]
    data: List[Dict[str, Any]]
    rowCount: int
    error: Optional[str] = None


# -------- Generate SQL Function --------
def generate_sql(db_schema: str, question: str) -> str:
    """Generate SQL query using the configured provider."""
    logger.info(f"🔍 Generating SQL for question: {question[:100]}…")

    if not db_schema or not question:
        logger.error("❌ Missing required parameters: db_schema or question")
        raise ValueError("Both schema and question are required")

    if PROVIDER == "local":
        prompt = f"""### Database Schema:
{db_schema}

### Question:
{question}

### Please write a SQL query to answer this question.
SQL Query:"""
        logger.debug(f"📝 Prompt length: {len(prompt)} characters")
        try:
            inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
            outputs = model.generate(
                **inputs,
                use_cache=True,
                max_new_tokens=256,
                max_length=1024,
                temperature=0.2,
                do_sample=False,
                eos_token_id=tokenizer.eos_token_id,
                pad_token_id=tokenizer.pad_token_id
            )
            sql_query = tokenizer.decode(outputs[0], skip_special_tokens=True)
            if "SELECT" in sql_query:
                sql_query = sql_query.split("SELECT", 1)[1]
                sql_query = "SELECT" + sql_query
            if ";" in sql_query:
                sql_query = sql_query.split(";", 1)[0] + ";"
            logger.info(f"✅ Generated SQL: {sql_query[:100]}…")
            return sql_query
        except Exception as e:
            logger.error(f"❌ Error generating SQL: {str(e)}")
            raise

    if PROVIDER == "remote_http":
        api_url = os.getenv("MODEL_API_URL")
        if not api_url:
            raise RuntimeError("MODEL_API_URL is required for remote_http provider")
        headers = {"Content-Type": "application/json"}
        auth_header = os.getenv("MODEL_API_AUTH_HEADER")
        auth_token = os.getenv("MODEL_API_AUTH_TOKEN")
        if auth_header and auth_token:
            headers[auth_header] = auth_token
        payload = {"db_schema": db_schema, "question": question}
        resp = requests.post(api_url, json=payload, headers=headers, timeout=60)
        if resp.status_code >= 400:
            raise RuntimeError(f"Remote HTTP error {resp.status_code}: {resp.text}")
        data = resp.json()
        # Accept either {sql_query: "..."} or {output: "..."}
        sql_query = data.get("sql_query") or data.get("output") or ""
        if not sql_query:
            raise RuntimeError("Remote HTTP response missing sql_query/output")
        return sql_query

    if PROVIDER == "replicate":
        replicate_token = os.getenv("REPLICATE_API_TOKEN")
        model_version = os.getenv("REPLICATE_MODEL_VERSION")
        if not (replicate_token and model_version):
            raise RuntimeError("REPLICATE_API_TOKEN and REPLICATE_MODEL_VERSION are required for replicate provider")
        url = "https://api.replicate.com/v1/predictions"
        headers = {
            "Authorization": f"Token {replicate_token}",
            "Content-Type": "application/json",
        }
        payload = {
            "version": model_version,
            "input": {"db_schema": db_schema, "question": question},
        }
        resp = requests.post(url, json=payload, headers=headers, timeout=60)
        if resp.status_code >= 400:
            raise RuntimeError(f"Replicate error {resp.status_code}: {resp.text}")
        prediction = resp.json()
        # Poll until completed/canceled/failed
        get_url = prediction.get("urls", {}).get("get")
        if not get_url:
            raise RuntimeError("Invalid Replicate response: missing get url")
        for _ in range(60):
            r = requests.get(get_url, headers=headers, timeout=30)
            j = r.json()
            status = j.get("status")
            if status in ("succeeded", "failed", "canceled"):
                if status != "succeeded":
                    raise RuntimeError(f"Replicate job {status}")
                output = j.get("output")
                if isinstance(output, list):
                    output = "\n".join(str(x) for x in output)
                if not output:
                    raise RuntimeError("Replicate returned empty output")
                return str(output)
            import time
            time.sleep(1)
        raise RuntimeError("Replicate job timeout")

    raise RuntimeError(f"Unknown provider: {PROVIDER}")


# -------- API Routes --------
@app.get("/")
async def root():
    """Root endpoint - service information"""
    return {
        "service": "DASH-Wiz Natural-SQL Backend",
        "version": "1.0",
        "status": "running",
        "provider": PROVIDER,
        "model": resolved_model_path if PROVIDER == "local" else None,
        "device": device,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        if PROVIDER == "local":
            if model is None or tokenizer is None:
                raise HTTPException(status_code=503, detail="Model not loaded")
            return {
                "status": "healthy",
                "provider": PROVIDER,
                "model_loaded": True,
                "device": device,
                "timestamp": datetime.now().isoformat(),
            }
        else:
            # For remote providers, just indicate readiness
            return {
                "status": "healthy",
                "provider": PROVIDER,
                "remote": True,
                "timestamp": datetime.now().isoformat(),
            }
    except Exception as e:
        logger.error(f"❌ Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")


@app.post("/generate-sql", response_model=QueryResponse)
async def generate_sql_endpoint(request: QueryRequest):
    """
    Generate an SQL query from a natural language question and DB schema.
    
    Args:
        request: QueryRequest containing db_schema and question
        
    Returns:
        QueryResponse with generated SQL query or error
    """
    start_time = datetime.now()
    logger.info("=" * 60)
    logger.info("📨 Received new SQL generation request")
    logger.info(f"📊 Schema length: {len(request.db_schema)} characters")
    logger.info(f"❓ Question: {request.question}")
    
    try:
        # Generate SQL using the model
        sql_query = generate_sql(request.db_schema, request.question)
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"⏱️  Processing time: {processing_time:.2f}s")
        logger.info("✅ Request completed successfully")
        logger.info("=" * 60)

        # For now, just return the SQL (no actual DB execution yet)
        return QueryResponse(
            sql_query=sql_query,
            columns=[],
            data=[],
            rowCount=0
        )

    except ValueError as e:
        # Client-side errors (bad input)
        logger.warning(f"⚠️  Validation error: {str(e)}")
        logger.info("=" * 60)
        return QueryResponse(
            sql_query="",
            columns=[],
            data=[],
            rowCount=0,
            error=f"Validation error: {str(e)}"
        )
        
    except Exception as e:
        # Server-side errors
        logger.error(f"❌ Internal error: {str(e)}", exc_info=True)
        logger.info("=" * 60)
        return QueryResponse(
            sql_query="",
            columns=[],
            data=[],
            rowCount=0,
            error=f"Internal server error: {str(e)}"
        )


# -------- Startup Event --------
@app.on_event("startup")
async def startup_event():
    """Log when the service is ready to accept requests"""
    logger.info("=" * 60)
    logger.info("🎉 DASH-Wiz Backend is READY to accept requests!")
    logger.info(f"📡 API Documentation: http://localhost:8000/docs")
    logger.info(f"🏥 Health Check: http://localhost:8000/health")
    logger.info("=" * 60)


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)