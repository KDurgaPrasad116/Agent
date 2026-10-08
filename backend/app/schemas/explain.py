from pydantic import BaseModel
from typing import List, Optional, Dict

class LegalTermDTO(BaseModel):
    term: str
    definition: str
    context: str

class ClauseExplanationDTO(BaseModel):
    clause_id: str
    clause_title: str
    plain_english: str
    what_this_means_for_you: str
    risk_flag: Optional[str] = None
    risk_reason: Optional[str] = None
    legal_terms: List[LegalTermDTO] = []
    questions_for_lawyer: List[str] = []
    regional_language_translation: Optional[Dict[str, str]] = None  # e.g. {"hi": "..."}

class DocumentSummaryDTO(BaseModel):
    document_id: str
    purpose: str
    parties_identified: List[str] = []
    key_obligations: List[str] = []
    key_dates_and_amounts: List[str] = []
    red_flags: List[str] = []
    governing_law_detected: Optional[str] = None
