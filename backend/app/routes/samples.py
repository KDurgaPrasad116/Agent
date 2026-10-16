from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
import re

from backend.app.database import get_db
from backend.app.models.document import DocumentModel
from backend.app.models.clause import ClauseModel
from backend.app.schemas.document import DocumentUploadResponse
from backend.app.services.parser_service import ParserService
from backend.app.services.clause_splitter import ClauseSplitter

router = APIRouter(prefix="/api/samples", tags=["samples"])

SAMPLES_DIR = Path("samples")
ALLOWED_EXT = {".txt", ".pdf", ".docx"}


def _human_title(stem: str) -> str:
    cleaned = re.sub(r"^sample\d+[_\-]*", "", stem, flags=re.IGNORECASE)
    cleaned = cleaned.replace("_", " ").replace("-", " ").strip()
    return cleaned[:1].upper() + cleaned[1:] if cleaned else stem


def _category_from_name(name: str) -> str:
    lowered = name.lower()
    if "nda" in lowered:
        return "Confidentiality"
    if "lease" in lowered or "rental" in lowered:
        return "Property"
    if "employ" in lowered:
        return "Employment"
    if "service" in lowered or "vendor" in lowered:
        return "Services"
    return "Contract"


def _discover_samples() -> List[Path]:
    if not SAMPLES_DIR.exists():
        return []
    files = [p for p in SAMPLES_DIR.iterdir() if p.is_file() and p.suffix.lower() in ALLOWED_EXT]
    return sorted(files, key=lambda p: p.name.lower())


def _find_sample(sample_id: str) -> Path:
    for path in _discover_samples():
        if path.stem == sample_id or path.name == sample_id:
            return path
    raise HTTPException(status_code=404, detail="Sample contract not found.")


def _preview_text(path: Path) -> str:
    try:
        if path.suffix.lower() == ".txt":
            raw = ParserService.parse_txt(path.read_bytes())
            snippet = " ".join(raw.split())
            return snippet[:220] + ("…" if len(snippet) > 220 else "")
    except Exception:
        pass
    return f"Sample file: {path.name}"


@router.get("")
@router.get("/")
def list_samples():
    items = []
    for path in _discover_samples():
        items.append({
            "id": path.stem,
            "filename": path.name,
            "title": _human_title(path.stem),
            "category": _category_from_name(path.stem),
            "description": _preview_text(path),
            "file_type": path.suffix.lower().lstrip("."),
        })
    return items


@router.post("/{sample_id}/open", response_model=DocumentUploadResponse)
def open_sample(sample_id: str, db: Session = Depends(get_db)):
    path = _find_sample(sample_id)
    content = path.read_bytes()
    name = path.name
    text, file_type, sha256_hash = ParserService.parse_file(name, content)

    segmented = ClauseSplitter.segment(text)
    if not segmented:
        segmented = [{
            "index": 1,
            "title": "Full Document Text",
            "text": text,
            "start_char": 0,
            "end_char": len(text),
            "clause_type": "GENERAL",
        }]

    doc_id = str(uuid.uuid4())
    db.add(DocumentModel(
        id=doc_id,
        file_name=name,
        file_type=file_type,
        raw_text=text,
        char_length=len(text),
        sha256_hash=sha256_hash,
        status="parsed",
    ))
    for item in segmented:
        db.add(ClauseModel(
            id=str(uuid.uuid4()),
            document_id=doc_id,
            clause_index=item["index"],
            title=item["title"],
            text=item["text"],
            start_char=item["start_char"],
            end_char=item["end_char"],
            clause_type=item["clause_type"],
            risk_level="SAFE",
            score=100.0,
        ))
    db.commit()

    return DocumentUploadResponse(
        document_id=doc_id,
        file_name=name,
        file_type=file_type,
        char_count=len(text),
        clause_count=len(segmented),
        sha256_hash=sha256_hash,
        message="Sample contract loaded.",
    )
