from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.chat_service import ChatService

router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    session_id: str
    question: str


@router.post("/chat")
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    if not req.session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required.")
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="question cannot be empty.")
    return ChatService.chat(req.session_id.strip(), req.question.strip(), db)


@router.get("/chat/history/{session_id}")
def get_history(session_id: str):
    history = ChatService.history(session_id)
    return {"session_id": session_id, "turns": len(history) // 2, "history": history}


@router.delete("/chat/session/{session_id}")
def clear_session(session_id: str):
    ChatService.clear(session_id)
    return {"message": "Conversation cleared.", "session_id": session_id}
