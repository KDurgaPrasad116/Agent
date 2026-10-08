from backend.app.database import Base
from .document import DocumentModel
from .clause import ClauseModel
from .score import ScoreModel, DeductionModel
from .correction import CorrectionModel
from .template import GeneratedDocumentModel

__all__ = [
    "Base",
    "DocumentModel",
    "ClauseModel",
    "ScoreModel",
    "DeductionModel",
    "CorrectionModel",
    "GeneratedDocumentModel",
]
