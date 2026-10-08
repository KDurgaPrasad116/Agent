from fastapi import APIRouter, HTTPException
from typing import List

from backend.app.schemas.generator import LegalTemplateDTO, GenerateDocumentRequest, GenerateDocumentResponse
from backend.app.services.generator_service import GeneratorService

router = APIRouter(prefix="/api", tags=["generator"])

@router.get("/templates", response_model=List[LegalTemplateDTO])
def list_templates():
    """
    Returns available legal contract templates with dynamic field specifications
    and optional clause libraries.
    """
    return GeneratorService.list_templates()

@router.post("/generate", response_model=GenerateDocumentResponse)
def generate_document(request: GenerateDocumentRequest):
    """
    Generates a draft legal agreement from wizard inputs, runs pre-export scoring,
    and returns full text and structure.
    """
    try:
        return GeneratorService.generate_document(
            template_id=request.template_id,
            field_values=request.field_values,
            selected_clause_ids=request.selected_clause_ids,
            jurisdiction=request.jurisdiction
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
