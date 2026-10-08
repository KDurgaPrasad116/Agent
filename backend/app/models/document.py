from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from backend.app.database import Base

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, txt
    raw_text = Column(Text, nullable=False)
    char_length = Column(Integer, nullable=False)
    sha256_hash = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String(50), default="processed")

    clauses = relationship("ClauseModel", back_populates="document", cascade="all, delete-orphan")
    deductions = relationship("DeductionModel", back_populates="document", cascade="all, delete-orphan")
    score = relationship("ScoreModel", back_populates="document", uselist=False, cascade="all, delete-orphan")
    corrections = relationship("CorrectionModel", back_populates="document", cascade="all, delete-orphan")
