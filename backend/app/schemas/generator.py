from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class TemplateFieldDTO(BaseModel):
    key: str
    label: str
    field_type: str  # text, number, date, select, textarea
    placeholder: Optional[str] = None
    required: bool = True
    default_value: Optional[Any] = None
    options: Optional[List[str]] = None
    help_text: Optional[str] = None

class TemplateClauseOptionDTO(BaseModel):
    id: str
    title: str
    category: str
    is_recommended: bool
    is_default: bool
    layman_explanation: str
    text_template: str

class LegalTemplateDTO(BaseModel):
    id: str
    name: str
    description: str
    category: str
    jurisdiction_supported: List[str] = ["India", "US", "UK", "General Common Law"]
    fields: List[TemplateFieldDTO]
    optional_clauses: List[TemplateClauseOptionDTO]

class GenerateDocumentRequest(BaseModel):
    template_id: str
    jurisdiction: str = "General Common Law"
    field_values: Dict[str, Any]
    selected_clause_ids: List[str]

class GenerateDocumentResponse(BaseModel):
    generated_id: str
    title: str
    full_text: str
    score_preview: float
    risk_band: str
    clauses: List[Dict[str, Any]]
    suggestions: List[str] = []
