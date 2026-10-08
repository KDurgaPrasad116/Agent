import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import settings
from backend.app.services.scoring_engine import ScoringEngine
from backend.app.database import init_db

client = TestClient(app)

def setup_module():
    init_db()

def test_weights_sum_to_one():
    weights = settings.weights_dict
    total_weight = sum(weights.values())
    assert abs(total_weight - 1.0) < 1e-6, f"Weights must sum to 1.0, got {total_weight}"

def test_predatory_contract_scoring():
    with open("samples/sample1_predatory_service_agreement.txt", "r", encoding="utf-8") as f:
        text = f.read()

    # 1. Upload
    up_res = client.post("/api/documents/upload", data={"raw_text": text, "file_name": "predatory.txt"})
    assert up_res.status_code == 200
    doc_id = up_res.json()["document_id"]

    # 2. Analyze
    an_res = client.post("/api/analyze", json={"document_id": doc_id})
    assert an_res.status_code == 200
    data = an_res.json()

    # Should be flagged as HIGH_RISK or MEDIUM_RISK with severe deductions
    assert data["overall_score"] < 60.0
    assert data["risk_band"] in ["HIGH_RISK", "MEDIUM_RISK"]
    assert data["breakdown"]["total_deductions_count"] >= 5

    # Check that unlimited liability was caught
    legal_risk = data["breakdown"]["criteria"]["legal_risk"]
    assert legal_risk["score"] < 70.0
    assert any("unlimited" in d["reason"].lower() for d in legal_risk["deductions"])

    # Check step-by-step derivation
    assert len(data["breakdown"]["step_by_step_derivation"]) == 5
    assert "Base 100" in data["breakdown"]["step_by_step_derivation"][0]

def test_standard_nda_scoring():
    with open("samples/sample3_standard_mutual_nda.txt", "r", encoding="utf-8") as f:
        text = f.read()

    # 1. Upload
    up_res = client.post("/api/documents/upload", data={"raw_text": text, "file_name": "mutual_nda.txt"})
    assert up_res.status_code == 200
    doc_id = up_res.json()["document_id"]

    # 2. Analyze
    an_res = client.post("/api/analyze", json={"document_id": doc_id})
    assert an_res.status_code == 200
    data = an_res.json()

    # Balanced NDA should score high
    assert data["overall_score"] >= 80.0
    assert data["risk_band"] == "LOW_RISK"

def test_deterministic_score_consistency():
    with open("samples/sample1_predatory_service_agreement.txt", "r", encoding="utf-8") as f:
        text = f.read()

    up1 = client.post("/api/documents/upload", data={"raw_text": text, "file_name": "run1.txt"}).json()
    an1 = client.post("/api/analyze", json={"document_id": up1["document_id"]}).json()

    up2 = client.post("/api/documents/upload", data={"raw_text": text, "file_name": "run2.txt"}).json()
    an2 = client.post("/api/analyze", json={"document_id": up2["document_id"]}).json()

    assert an1["overall_score"] == an2["overall_score"], "Scores must be identical for identical inputs"
    assert an1["breakdown"]["total_deductions_count"] == an2["breakdown"]["total_deductions_count"]
