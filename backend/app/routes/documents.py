from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid

from backend.app.database import get_db
from backend.app.models.document import DocumentModel
from backend.app.models.clause import ClauseModel
from backend.app.models.score import ScoreModel, DeductionModel
from backend.app.models.correction import CorrectionModel
from backend.app.models.template import GeneratedDocumentModel
from backend.app.schemas.document import DocumentUploadResponse, DocumentInfo
from backend.app.schemas.clause import ClauseDTO, ClauseListResponse
from backend.app.services.parser_service import ParserService
from backend.app.services.clause_splitter import ClauseSplitter

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    file_name: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload and parse a legal document (PDF, DOCX, or TXT) or raw text.
    Extracts text, calculates SHA-256 hash, and segments into numbered clauses.
    """
    if file is not None:
        content = await file.read()
        if len(content) > 15 * 1024 * 1024:  # 15 MB limit
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds maximum permitted limit (15MB)."
            )
        name = file.filename or "uploaded_contract.txt"
        text, file_type, sha256_hash = ParserService.parse_file(name, content)
    elif raw_text and raw_text.strip():
        name = file_name or "pasted_contract.txt"
        text = raw_text.strip().replace("\r\n", "\n").replace("\r", "\n")
        file_type = "txt"
        sha256_hash = ParserService.compute_sha256(text)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a document file or raw_text must be provided."
        )

    # Segment document into clauses
    segmented_clauses = ClauseSplitter.segment(text)
    if not segmented_clauses:
        # Fallback to single clause if segmentation yielded empty
        segmented_clauses = [{
            "index": 1,
            "title": "Full Document Text",
            "text": text,
            "start_char": 0,
            "end_char": len(text),
            "clause_type": "GENERAL"
        }]

    # Create Document record
    doc_id = str(uuid.uuid4())
    doc_record = DocumentModel(
        id=doc_id,
        file_name=name,
        file_type=file_type,
        raw_text=text,
        char_length=len(text),
        sha256_hash=sha256_hash,
        status="parsed"
    )
    db.add(doc_record)

    # Save segmented clauses
    for item in segmented_clauses:
        clause_record = ClauseModel(
            id=str(uuid.uuid4()),
            document_id=doc_id,
            clause_index=item["index"],
            title=item["title"],
            text=item["text"],
            start_char=item["start_char"],
            end_char=item["end_char"],
            clause_type=item["clause_type"],
            risk_level="SAFE",
            score=100.0
        )
        db.add(clause_record)

    db.commit()

    return DocumentUploadResponse(
        document_id=doc_id,
        file_name=name,
        file_type=file_type,
        char_count=len(text),
        clause_count=len(segmented_clauses),
        sha256_hash=sha256_hash,
        message="Document successfully parsed and segmented into clauses."
    )

@router.get("/{document_id}", response_model=DocumentInfo)
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return DocumentInfo(
        id=doc.id,
        file_name=doc.file_name,
        file_type=doc.file_type,
        char_length=doc.char_length,
        created_at=doc.created_at,
        status=doc.status
    )

@router.get("/{document_id}/clauses", response_model=ClauseListResponse)
def get_document_clauses(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    clauses = db.query(ClauseModel).filter(ClauseModel.document_id == document_id).order_by(ClauseModel.clause_index).all()
    dtos = [
        ClauseDTO(
            id=c.id,
            document_id=c.document_id,
            index=c.clause_index,
            title=c.title,
            text=c.text,
            start_char=c.start_char,
            end_char=c.end_char,
            clause_type=c.clause_type,
            risk_level=c.risk_level,
            score=c.score,
            flagged_issues=[]
        )
        for c in clauses
    ]
    return ClauseListResponse(
        document_id=document_id,
        total_clauses=len(dtos),
        clauses=dtos
    )

@router.delete("/{document_id}")
def delete_document_data(document_id: str, db: Session = Depends(get_db)):
    """
    GDPR & Privacy 'Delete My Data' endpoint.
    Permanently purges document, clauses, scores, deductions, and corrections.
    """
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    db.delete(doc)
    db.commit()
    return {
        "status": "success",
        "deleted_id": document_id,
        "message": "All document data and derived analyses have been permanently purged."
    }

@router.delete("/purge/all")
def purge_all_data(db: Session = Depends(get_db)):
    """
    Privacy purge: wipes all stored documents and analysis records from SQLite.
    """
    db.query(CorrectionModel).delete()
    db.query(DeductionModel).delete()
    db.query(ScoreModel).delete()
    db.query(ClauseModel).delete()
    db.query(DocumentModel).delete()
    db.query(GeneratedDocumentModel).delete()
    db.commit()
    return {
        "status": "success",
        "message": "All user data, documents, and derived tables purged completely."
    }
