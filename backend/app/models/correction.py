from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from backend.app.database import Base

class CorrectionModel(Base):
    __tablename__ = "corrections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    clause_id = Column(String(36), ForeignKey("clauses.id", ondelete="CASCADE"), nullable=False)
    original_text = Column(Text, nullable=False)
    revised_text = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    legal_doctrine = Column(String(255), nullable=True)
    status = Column(String(50), default="pending")  # pending, accepted, rejected, modified
    diff_json = Column(Text, nullable=True)

    document = relationship("DocumentModel", back_populates="corrections")
    clause = relationship("ClauseModel", back_populates="corrections")
