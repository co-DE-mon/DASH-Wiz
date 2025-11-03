import os
import requests

BASE = os.getenv("BASE", "http://localhost:8000")

def test_root():
    r = requests.get(f"{BASE}/")
    r.raise_for_status()
    data = r.json()
    assert data.get("status") == "running"

def test_health():
    r = requests.get(f"{BASE}/health")
    r.raise_for_status()
    data = r.json()
    assert data.get("model_loaded") is True

def test_generate_sql():
    payload = {
        "db_schema": "CREATE TABLE users(id INT, name TEXT, created_at TIMESTAMP);",
        "question": "Show all users created this month",
    }
    r = requests.post(f"{BASE}/generate-sql", json=payload)
    r.raise_for_status()
    data = r.json()
    assert "sql_query" in data


