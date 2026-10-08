import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import init_db

client = TestClient(app)

def setup_module():
    init_db()

def test_e2e_predatory_pipeline():
    """
    Full pipeline on Sample 1:
    Upload -> Score -> Explain -> Correct -> Rescore -> Export DOCX & PDF -> Delete
    """
    with open("samples/sample1_predatory_service_agreement.txt", "rb") as f:
        file_bytes = f.read()

    # 1. Upload
    res_up = client.post(
        "/api/documents/upload",
        files={"file": ("sample1_predatory.txt", file_bytes, "text/plain")}
    )
    assert res_up.status_code == 200
    doc_id = res_up.json()["document_id"]
    assert res_up.json()["clause_count"] >= 10

    # 2. Score / Analyze
    res_an = client.post("/api/analyze", json={"document_id": doc_id})
    assert res_an.status_code == 200
    an_data = res_an.json()
    assert an_data["risk_band"] in ["HIGH_RISK", "MEDIUM_RISK"]
    first_score = an_data["overall_score"]

    # 3. Explain first clause
    first_clause_id = an_data["clauses"][0]["id"]
    res_exp = client.get(f"/api/clauses/{first_clause_id}/explain?lang=en")
    assert res_exp.status_code == 200
    exp_data = res_exp.json()
    assert len(exp_data["plain_english"]) > 0

    # 4. Correct flagged clauses
    res_corr = client.post("/api/correct", json={"document_id": doc_id})
    assert res_corr.status_code == 200
    corr_data = res_corr.json()
    assert corr_data["total_flagged"] > 0

    # 5. Rescore
    accepted = {c["clause_id"]: c["revised_text"] for c in corr_data["corrections"]}
    res_resc = client.post("/api/rescore", json={"document_id": doc_id, "updated_clauses": accepted})
    assert res_resc.status_code == 200
    resc_data = res_resc.json()
    assert resc_data["after_score"] > first_score

    # 6. Export DOCX
    res_docx = client.post("/api/export", json={"document_id": doc_id, "export_format": "docx", "mode": "tracked_changes"})
    assert res_docx.status_code == 200
    assert len(res_docx.content) > 1000

    # 7. Export PDF
    res_pdf = client.post("/api/export", json={"document_id": doc_id, "export_format": "pdf", "mode": "clean"})
    assert res_pdf.status_code == 200
    assert len(res_pdf.content) > 1000

    # 8. Privacy Delete
    res_del = client.delete(f"/api/documents/{doc_id}")
    assert res_del.status_code == 200

def test_e2e_commercial_lease_docx():
    with open("samples/sample2_commercial_lease_agreement.docx", "rb") as f:
        file_bytes = f.read()

    res_up = client.post(
        "/api/documents/upload",
        files={"file": ("lease.docx", file_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    )
    assert res_up.status_code == 200
    doc_id = res_up.json()["document_id"]

    res_an = client.post("/api/analyze", json={"document_id": doc_id})
    assert res_an.status_code == 200
    assert len(res_an.json()["clauses"]) >= 4

    client.delete(f"/api/documents/{doc_id}")

def test_e2e_mutual_nda_txt():
    with open("samples/sample3_standard_mutual_nda.txt", "rb") as f:
        file_bytes = f.read()

    res_up = client.post(
        "/api/documents/upload",
        files={"file": ("nda.txt", file_bytes, "text/plain")}
    )
    assert res_up.status_code == 200
    doc_id = res_up.json()["document_id"]

    res_an = client.post("/api/analyze", json={"document_id": doc_id})
    assert res_an.status_code == 200
    assert res_an.json()["risk_band"] == "LOW_RISK"

    client.delete(f"/api/documents/{doc_id}")

def test_e2e_employment_contract_pdf():
    with open("samples/sample4_employment_contract.pdf", "rb") as f:
        file_bytes = f.read()

    res_up = client.post(
        "/api/documents/upload",
        files={"file": ("employment.pdf", file_bytes, "application/pdf")}
    )
    assert res_up.status_code == 200
    doc_id = res_up.json()["document_id"]

    res_an = client.post("/api/analyze", json={"document_id": doc_id})
    assert res_an.status_code == 200
    assert len(res_an.json()["clauses"]) >= 4

    client.delete(f"/api/documents/{doc_id}")
