"""Document-grounded chat helper used by the optional legacy route."""

from typing import Dict, List
from rag.retriever import SessionRetriever, RAGRetriever


class ChatbotAgent:
    def __init__(self):
        self.sessions: Dict[str, List[Dict[str, str]]] = {}
        self.global_rag = None

    def _get_global_rag(self):
        if self.global_rag is None:
            try:
                self.global_rag = RAGRetriever()
            except Exception:
                self.global_rag = None
        return self.global_rag

    def chat(self, session_id: str, question: str) -> dict:
        if session_id not in self.sessions:
            self.sessions[session_id] = []

        history = self.sessions[session_id]
        turn = len(history) // 2 + 1

        retriever = SessionRetriever.load(session_id)
        doc_context = retriever.retrieve(question, k=3) if retriever else ""

        statutory_context = ""
        rag = self._get_global_rag()
        if rag and hasattr(rag, "is_ready") and rag.is_ready():
            try:
                statutory_context = rag.retrieve(question, k=2)
            except Exception:
                statutory_context = ""

        context_used = doc_context or statutory_context or "No matching clause found."
        answer = (
            "From the contract text on hand:\n\n"
            f"{context_used}\n\n"
            "Read that section against the rest of the deal before you sign. "
            "This is not a substitute for a lawyer."
        )

        history.append({"role": "user", "content": question})
        history.append({"role": "assistant", "content": answer})

        return {
            "session_id": session_id,
            "answer": answer,
            "context_used": context_used,
            "turn": turn,
            "source": "document",
        }

    def get_history(self, session_id: str) -> list:
        return self.sessions.get(session_id, [])

    def clear_session(self, session_id: str):
        self.sessions.pop(session_id, None)
