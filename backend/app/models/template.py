from sqlalchemy import Column, String, Float, Text, DateTime
from datetime import datetime, timezone
import uuid
from backend.app.database import Base

class GeneratedDocumentModel(Base):
    __tablename__ = "generated_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    template_id = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    field_values_json = Column(Text, nullable=False)
    clauses_json = Column(Text, nullable=False)
    full_text = Column(Text, nullable=False)
    overall_score = Column(Float, default=100.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
