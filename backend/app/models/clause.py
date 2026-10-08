from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from backend.app.database import Base

class ClauseModel(Base):
    __tablename__ = "clauses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    clause_index = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    text = Column(Text, nullable=False)
    start_char = Column(Integer, nullable=False)
    end_char = Column(Integer, nullable=False)
    clause_type = Column(String(100), default="GENERAL")
    risk_level = Column(String(50), default="SAFE")  # SAFE, WARNING, DANGER
    score = Column(Float, default=100.0)

    document = relationship("DocumentModel", back_populates="clauses")
    deductions = relationship("DeductionModel", back_populates="clause", cascade="all, delete-orphan")
    corrections = relationship("CorrectionModel", back_populates="clause", cascade="all, delete-orphan")
