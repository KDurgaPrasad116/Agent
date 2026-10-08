import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import init_db

client = TestClient(app)

def setup_module():
    init_db()

def test_generate_corrections_and_diff_tokens():
    with open("samples/sample1_predatory_service_agreement.txt", "r", encoding="utf-8") as f:
        text = f.read()

    up = client.post("/api/documents/upload", data={"raw_text": text, "file_name": "pred_diff.txt"}).json()
    doc_id = up["document_id"]
    client.post("/api/analyze", json={"document_id": doc_id})

    # Generate corrections
    corr_res = client.post("/api/correct", json={"document_id": doc_id})
    assert corr_res.status_code == 200
    c_data = corr_res.json()

    assert c_data["total_flagged"] > 0
    assert len(c_data["corrections"]) > 0

    first_corr = c_data["corrections"][0]
    assert len(first_corr["revised_text"]) > 20
    assert len(first_corr["diff_tokens"]) > 0
    # Verify diff tokens have valid types
    valid_types = {"equal", "delete", "insert"}
    for tok in first_corr["diff_tokens"]:
        assert tok["type"] in valid_types
        assert len(tok["value"]) > 0

def test_rescore_after_accepting_corrections():
    with open("samples/sample1_predatory_service_agreement.txt", "r", encoding="utf-8") as f:
        text = f.read()

    up = client.post("/api/documents/upload", data={"raw_text": text, "file_name": "pred_rescore.txt"}).json()
    doc_id = up["document_id"]
    an = client.post("/api/analyze", json={"document_id": doc_id}).json()
    initial_score = an["overall_score"]

    corr_res = client.post("/api/correct", json={"document_id": doc_id}).json()
    
    # Accept all revised texts
    updated_map = {c["clause_id"]: c["revised_text"] for c in corr_res["corrections"]}
    
    rescore_res = client.post("/api/rescore", json={
        "document_id": doc_id,
        "updated_clauses": updated_map
    })
    assert rescore_res.status_code == 200
    rescore_data = rescore_res.json()

    assert rescore_data["document_id"] == doc_id
    assert rescore_data["after_score"] > initial_score, f"After score {rescore_data['after_score']} should exceed initial {initial_score}"
    assert rescore_data["delta"] > 0
    assert rescore_data["improved"] is True
    assert len(rescore_data["change_log"]) == len(updated_map)
