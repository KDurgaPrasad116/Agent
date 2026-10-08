from .document import DocumentUploadResponse, DocumentInfo
from .clause import ClauseDTO, ClauseListResponse
from .score import DeductionDTO, CriterionScoreDTO, ScoreBreakdownDTO, AnalyzeResponse
from .explain import ClauseExplanationDTO, DocumentSummaryDTO, LegalTermDTO
from .correct import ClauseCorrectionDTO, CorrectionResponse, RescoreRequest, RescoreResponse
from .generator import LegalTemplateDTO, TemplateFieldDTO, TemplateClauseOptionDTO, GenerateDocumentRequest, GenerateDocumentResponse
from .export import ExportRequest

__all__ = [
    "DocumentUploadResponse",
    "DocumentInfo",
    "ClauseDTO",
    "ClauseListResponse",
    "DeductionDTO",
    "CriterionScoreDTO",
    "ScoreBreakdownDTO",
    "AnalyzeResponse",
    "ClauseExplanationDTO",
    "DocumentSummaryDTO",
    "LegalTermDTO",
    "ClauseCorrectionDTO",
    "CorrectionResponse",
    "RescoreRequest",
    "RescoreResponse",
    "LegalTemplateDTO",
    "TemplateFieldDTO",
    "TemplateClauseOptionDTO",
    "GenerateDocumentRequest",
    "GenerateDocumentResponse",
    "ExportRequest",
]
