import os
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.parser_service import ParserService
from backend.app.services.clause_splitter import ClauseSplitter
from backend.app.database import SessionLocal, init_db
from backend.app.models.document import DocumentModel

client = TestClient(app)

def setup_module():
    init_db()

def test_parse_sample_txt():
    with open("samples/sample1_predatory_service_agreement.txt", "rb") as f:
        content = f.read()
    text, ftype, sha256 = ParserService.parse_file("sample1.txt", content)
    assert ftype == "txt"
    assert len(text) > 100
    assert "MASTER SERVICES AGREEMENT" in text
    assert len(sha256) == 64

def test_parse_sample_docx():
    with open("samples/sample2_commercial_lease_agreement.docx", "rb") as f:
        content = f.read()
    text, ftype, sha256 = ParserService.parse_file("sample2.docx", content)
    assert ftype == "docx"
    assert "COMMERCIAL LEASE AGREEMENT" in text
    assert "Suite 400" in text

def test_parse_sample_pdf():
    with open("samples/sample4_employment_contract.pdf", "rb") as f:
        content = f.read()
    text, ftype, sha256 = ParserService.parse_file("sample4.pdf", content)
    assert ftype == "pdf"
    assert "EMPLOYMENT AGREEMENT" in text.upper()
    assert "180,000" in text

def test_clause_splitter_offsets_integrity():
    with open("samples/sample1_predatory_service_agreement.txt", "r", encoding="utf-8") as f:
        raw_text = f.read()

    clauses = ClauseSplitter.segment(raw_text)
    assert len(clauses) >= 10, f"Expected at least 10 clauses, found {len(clauses)}"
    
    # Verify exact character offset integrity
    for c in clauses:
        start = c["start_char"]
        end = c["end_char"]
        sliced = raw_text[start:end].strip()
        assert c["text"] == sliced, f"Offset mismatch in clause {c['index']}: '{c['text'][:30]}' != '{sliced[:30]}'"
        assert c["clause_type"] in ["INDEMNITY", "LIABILITY", "TERMINATION", "NON_COMPETE", "CONFIDENTIALITY", "GOVERNING_LAW", "PAYMENT", "INTELLECTUAL_PROPERTY", "GENERAL", "PREAMBLE"]

def test_upload_and_privacy_delete_flow():
    # 1. Upload pasted text
    payload = {
        "raw_text": "Clause 1: Confidentiality\nThis is secret.\n\nClause 2: Termination\nEither party may cancel.",
        "file_name": "test_nda.txt"
    }
    response = client.post("/api/documents/upload", data=payload)
    assert response.status_code == 200, response.text
    data = response.json()
    doc_id = data["document_id"]
    assert data["clause_count"] >= 2
    assert data["char_count"] > 0

    # 2. Get clauses
    c_res = client.get(f"/api/documents/{doc_id}/clauses")
    assert c_res.status_code == 200
    c_data = c_res.json()
    assert len(c_data["clauses"]) >= 2

    # 3. Privacy delete
    del_res = client.delete(f"/api/documents/{doc_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"

    # 4. Verify document is gone
    get_res = client.get(f"/api/documents/{doc_id}")
    assert get_res.status_code == 404
