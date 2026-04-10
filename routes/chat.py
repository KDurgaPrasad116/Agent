"""
routes/chat.py

Legal chatbot endpoint with conversational memory.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.chatbot_agent import ChatbotAgent

router = APIRouter()

# Single shared agent instance (memory is session-keyed internally)
_chatbot = ChatbotAgent()


# ── Request / Response schemas ────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str
    question:   str


class ChatResponse(BaseModel):
    session_id:   str
    question:     str
    answer:       str
    context_used: str
    turn:         int
    source:       str   # "llm" or "template"


class ClearRequest(BaseModel):
    session_id: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Ask a question about the previously uploaded document.

    Requires:
        session_id — returned by POST /analyze/multilingual
        question   — your legal question in any language (English recommended)

    The chatbot:
        - Retrieves relevant clauses from the document (RAG)
        - Maintains conversation history per session
        - Responds as a senior legal advisor
        - Uses Ollama/llama3 if running, else uses grounded template responses
    """
    if not req.session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required.")
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="question cannot be empty.")

    result = _chatbot.chat(
        session_id=req.session_id,
        question=req.question.strip(),
    )

    return ChatResponse(
        session_id=result["session_id"],
        question=req.question,
        answer=result["answer"],
        context_used=result["context_used"],
        turn=result["turn"],
        source=result["source"],
    )


@router.get("/chat/history/{session_id}")
async def get_history(session_id: str):
    """
    Retrieve the conversation history for a session.
    """
    history = _chatbot.get_history(session_id)
    return {
        "session_id": session_id,
        "turns":      len(history) // 2,
        "history":    history,
    }


@router.delete("/chat/session")
async def clear_session(req: ClearRequest):
    """
    Clear conversation memory for a session.
    """
    _chatbot.clear_session(req.session_id)
    return {"message": f"Session '{req.session_id}' cleared."}
