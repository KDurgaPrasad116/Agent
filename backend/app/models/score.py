from sqlalchemy import Column, String, Float, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
import uuid
from backend.app.database import Base

class ScoreModel(Base):
    __tablename__ = "scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, unique=True)
    overall_score = Column(Float, nullable=False)
    risk_band = Column(String(50), nullable=False)  # LOW_RISK, MEDIUM_RISK, HIGH_RISK
    formula = Column(String(255), nullable=False)
    clarity_score = Column(Float, default=100.0)
    completeness_score = Column(Float, default=100.0)
    fairness_score = Column(Float, default=100.0)
    legal_risk_score = Column(Float, default=100.0)
    compliance_score = Column(Float, default=100.0)
    derivation_json = Column(Text, nullable=False)  # JSON array of steps
    global_summary_json = Column(Text, nullable=True) # JSON summary

    document = relationship("DocumentModel", back_populates="score")

class DeductionModel(Base):
    __tablename__ = "deductions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    clause_id = Column(String(36), ForeignKey("clauses.id", ondelete="CASCADE"), nullable=True)
    criterion = Column(String(50), nullable=False)  # clarity, completeness, fairness, legal_risk, compliance
    points = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    trigger_text = Column(Text, nullable=True)
    source = Column(String(50), default="rule")  # rule, llm
    remedy_hint = Column(Text, nullable=True)

    document = relationship("DocumentModel", back_populates="deductions")
    clause = relationship("ClauseModel", back_populates="deductions")
