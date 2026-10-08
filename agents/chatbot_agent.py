"""
<<<<<<< HEAD
Chatbot agent using a local flan-t5-base model and RAG context.
"""
import logging
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from rag.retriever import SessionRetriever

logger = logging.getLogger(__name__)

class ChatbotAgent:
    def __init__(self, model_name="google/flan-t5-base"):
        self.model_name = model_name
        self._tokenizer = None
        self._model = None
        self._history = {}
        
    def _load(self):
        if self._model is None:
            try:
                logger.info(f"Loading local LLM: {self.model_name}")
                self._tokenizer = AutoTokenizer.from_pretrained(self.model_name)
                self._model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)
                self._model.eval()
            except Exception as e:
                logger.error(f"Failed to load LLM: {e}")
                self._model = "fallback"

    def chat(self, session_id: str, question: str) -> dict:
        self._load()
        
        # 1. Retrieve Context
        retriever = SessionRetriever.load(session_id)
        context = ""
        if retriever:
            context = retriever.retrieve(question)
            
        # 2. Update History
        if session_id not in self._history:
            self._history[session_id] = []
        self._history[session_id].append({"role": "user", "content": question})
        turn = len(self._history[session_id]) // 2 + 1
        
        # 3. Generate Answer
        if self._model == "fallback" or not self._model:
            answer = (
                "I am a legal assistant. Based on the document context:\n\n"
                f"{context[:500]}...\n\n"
                "Please review the document carefully."
            )
            source = "template"
        else:
            prompt = (
                f"You are a legal advisor. Answer the question using the context below.\n\n"
                f"Context: {context}\n\n"
                f"Question: {question}\n\n"
                f"Answer:"
            )
            try:
                inputs = self._tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
                with torch.no_grad():
                    outputs = self._model.generate(**inputs, max_new_tokens=150)
                answer = self._tokenizer.decode(outputs[0], skip_special_tokens=True)
                source = "llm"
            except Exception as e:
                logger.error(f"Generation error: {e}")
                answer = "I encountered an error analyzing the context."
                source = "error"
                
        self._history[session_id].append({"role": "assistant", "content": answer})
        
        return {
            "session_id": session_id,
            "answer": answer,
            "context_used": context,
            "turn": turn,
            "source": source
        }

    def get_history(self, session_id: str) -> list:
        return self._history.get(session_id, [])

    def clear_session(self, session_id: str):
        if session_id in self._history:
            del self._history[session_id]
=======
agents/chatbot_agent.py

Legal Chatbot Agent with conversational session memory and RAG context retrieval.
"""

from typing import Dict, List
import logging
from rag.retriever import SessionRetriever, RAGRetriever

logger = logging.getLogger(__name__)


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

        # 1. Retrieve session document context
        retriever = SessionRetriever.load(session_id)
        doc_context = retriever.retrieve(question, k=3) if retriever else ""

        # 2. If no session doc context, fallback to global statutory legal corpus
        statutory_context = None
        rag = self._get_global_rag()
        if rag and rag.is_ready():
            try:
                statutory_context = rag.retrieve(question, k=2)
            except Exception:
                pass

        context_used = doc_context or statutory_context or "No specific clause reference found."

        # 3. Grounded legal advisory response
        answer = (
            f"Based on the analyzed document terms and relevant legal doctrines:\n\n"
            f"Relevant Clauses:\n{context_used}\n\n"
            f"Advisory: Please review the specific rights, liabilities, and obligations above. "
            f"If predatory terms or unilateral termination/waiver provisions apply, consultation with legal counsel is recommended prior to signing."
        )

        history.append({"role": "user", "content": question})
        history.append({"role": "assistant", "content": answer})

        return {
            "session_id": session_id,
            "answer": answer,
            "context_used": context_used,
            "turn": turn,
            "source": "template",
        }

    def get_history(self, session_id: str) -> list:
        return self.sessions.get(session_id, [])

    def clear_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]
>>>>>>> 3a27112 (Pushing major agent changes)
