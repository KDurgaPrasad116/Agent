"""
routes/analyze.py

New multilingual analyze endpoint.
The original /analyze endpoint in app.py is untouched.
"""

import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from pipeline.multilingual_pipeline import run_multilingual_pipeline
from rag.retriever import RAGRetriever, SessionRetriever

router = APIRouter()

# Global RAG retriever (loaded once at startup)
_global_rag = RAGRetriever()


@router.post("/analyze/multilingual")
async def analyze_multilingual(file: UploadFile = File(...)):
    """
    Multilingual document analysis.

    - Accepts PDF, DOCX, TXT
    - Auto-detects language (English / Hindi / Kannada)
    - Translates to English if needed (MarianMT, offline)
    - Classifies clauses, detects illegal terms, scores risk
    - Returns session_id for follow-up chatbot questions

    Returns:
        Full analysis JSON including per-clause classification,
        risk scores, legality flags, and a Sign/Review/Reject decision.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    allowed = (".pdf", ".docx", ".txt")
    if not any(file.filename.lower().endswith(ext) for ext in allowed):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed)}",
        )

    # Read file bytes (so we can use them in both pipeline + session index)
    content = await file.read()

    # Run multilingual pipeline
    result = await run_multilingual_pipeline(
        file_content=content,
        filename=file.filename,
        rag_retriever=_global_rag if _global_rag.is_ready() else None,
    )

    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])

    # Build a per-document session index for chatbot follow-up
    session_id = str(uuid.uuid4())
    translated_text = " ".join(
        c.get("text_translated", "") for c in result.get("clauses", [])
    )
    if translated_text.strip():
        SessionRetriever.build(session_id, translated_text)

    result["session_id"] = session_id
    result["chat_hint"]  = (
        f"Use POST /chat with session_id='{session_id}' "
        "to ask questions about this document."
    )

    return result
