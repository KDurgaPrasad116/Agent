from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.schemas.export import ExportRequest
from backend.app.services.export_service import ExportService

router = APIRouter(prefix="/api", tags=["export"])

@router.post("/export")
def export_document(
    request: ExportRequest,
    db: Session = Depends(get_db)
):
    """
    Exports legal document in DOCX (clean or tracked-changes) or PDF format.
    """
    fmt = request.export_format.lower()
    mode = request.mode.lower()

    if fmt == "docx":
        buffer = ExportService.export_docx(request.document_id, mode, db)
        return Response(
            content=buffer.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=lexclear_document_{mode}.docx"}
        )
    elif fmt == "pdf":
        buffer = ExportService.export_pdf(request.document_id, db)
        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=lexclear_document.pdf"}
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format. Use 'docx' or 'pdf'.")
