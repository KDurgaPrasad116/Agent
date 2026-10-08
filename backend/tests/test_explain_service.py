import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import init_db

client = TestClient(app)

def setup_module():
    init_db()

def test_explain_clause_and_layman_mode():
    with open("samples/sample1_predatory_service_agreement.txt", "r", encoding="utf-8") as f:
        text = f.read()

    up = client.post("/api/documents/upload", data={"raw_text": text, "file_name": "pred_explain.txt"}).json()
    doc_id = up["document_id"]
    client.post("/api/analyze", json={"document_id": doc_id})

    # Get clauses
    c_res = client.get(f"/api/documents/{doc_id}/clauses").json()
    # Find indemnity or liability clause
    clause = next(c for c in c_res["clauses"] if "Indemn" in c["title"] or "Liability" in c["title"])
    cid = clause["id"]

    # 1. Fetch English explanation
    exp_res = client.get(f"/api/clauses/{cid}/explain?lang=en")
    assert exp_res.status_code == 200
    data = exp_res.json()

    assert data["clause_id"] == cid
    assert len(data["plain_english"]) > 20
    assert len(data["what_this_means_for_you"]) > 20
    assert len(data["questions_for_lawyer"]) >= 2
    assert len(data["legal_terms"]) >= 1
    assert "term" in data["legal_terms"][0]
    assert "definition" in data["legal_terms"][0]

    # 2. Test language toggle (Hindi)
    hi_res = client.get(f"/api/clauses/{cid}/explain?lang=hi")
    assert hi_res.status_code == 200
    hi_data = hi_res.json()
    assert "खंड" in hi_data["plain_english"] or "नियम" in hi_data["plain_english"]

def test_document_global_summary():
    with open("samples/sample1_predatory_service_agreement.txt", "r", encoding="utf-8") as f:
        text = f.read()

    up = client.post("/api/documents/upload", data={"raw_text": text, "file_name": "summary_test.txt"}).json()
    doc_id = up["document_id"]
    client.post("/api/analyze", json={"document_id": doc_id})

    sum_res = client.get(f"/api/documents/{doc_id}/summary")
    assert sum_res.status_code == 200
    s_data = sum_res.json()

    assert s_data["document_id"] == doc_id
    assert "SERVICES" in s_data["purpose"] or "Agreement" in s_data["purpose"]
    assert len(s_data["parties_identified"]) >= 1
    assert len(s_data["key_obligations"]) >= 1
    assert len(s_data["red_flags"]) >= 1
