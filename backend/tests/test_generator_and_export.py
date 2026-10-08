import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import init_db

client = TestClient(app)

def setup_module():
    init_db()

def test_list_templates():
    res = client.get("/api/templates")
    assert res.status_code == 200
    templates = res.json()
    assert len(templates) >= 6
    t_ids = {t["id"] for t in templates}
    assert {"nda", "rental_lease", "employment", "service_freelance", "sale_agreement", "power_of_attorney"}.issubset(t_ids)

    # Check field schemas
    for t in templates:
        assert len(t["fields"]) >= 4
        assert len(t["optional_clauses"]) >= 1

def test_generate_document_and_pre_export_score():
    req = {
        "template_id": "service_freelance",
        "jurisdiction": "Delaware, USA",
        "field_values": {
            "client_name": "Acme Innovations Inc",
            "contractor_name": "John Doe",
            "project_description": "Cloud migration and security audit",
            "fee_amount": 25000,
            "payment_days": 30,
            "notice_days": 14
        },
        "selected_clause_ids": ["opt_change_order", "opt_portfolio_rights"]
    }

    res = client.post("/api/generate", json=req)
    assert res.status_code == 200
    data = res.json()

    assert data["title"].startswith("Master Freelance")
    assert "Cloud migration" in data["full_text"]
    assert "Acme Innovations" in data["full_text"]
    assert data["score_preview"] >= 80.0
    assert data["risk_band"] == "LOW_RISK"
    assert len(data["clauses"]) >= 5

def test_export_docx_and_pdf():
    # 1. Upload sample
    with open("samples/sample1_predatory_service_agreement.txt", "r", encoding="utf-8") as f:
        text = f.read()

    up = client.post("/api/documents/upload", data={"raw_text": text, "file_name": "export_test.txt"}).json()
    doc_id = up["document_id"]
    client.post("/api/analyze", json={"document_id": doc_id})

    # 2. Export clean DOCX
    docx_res = client.post("/api/export", json={"document_id": doc_id, "export_format": "docx", "mode": "clean"})
    assert docx_res.status_code == 200
    assert docx_res.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    assert len(docx_res.content) > 1000

    # 3. Export tracked changes DOCX
    tc_res = client.post("/api/export", json={"document_id": doc_id, "export_format": "docx", "mode": "tracked_changes"})
    assert tc_res.status_code == 200
    assert len(tc_res.content) > 1000

    # 4. Export PDF
    pdf_res = client.post("/api/export", json={"document_id": doc_id, "export_format": "pdf", "mode": "clean"})
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000
