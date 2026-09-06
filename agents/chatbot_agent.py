"""
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
