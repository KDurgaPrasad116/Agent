"""
RAG retriever — two modes:

1. Global index  : built from rag/legal_corpus/ via ingest.py (always available)
2. Session index : built from a specific uploaded document for chatbot context
"""

import os
import logging
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

FAISS_PATH    = "rag/faiss_index"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Shared embeddings instance (loaded once)
_embeddings: HuggingFaceEmbeddings | None = None


def _get_embeddings() -> HuggingFaceEmbeddings:
    global _embeddings
    if _embeddings is None:
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL}")
        _embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    return _embeddings


class RAGRetriever:
    """Retriever backed by the global legal corpus FAISS index."""

    def __init__(self):
        self.db = None
        self._load()

    def _load(self):
        if not os.path.exists(FAISS_PATH):
            logger.warning(
                f"FAISS index not found at '{FAISS_PATH}'. "
                "Run python rag/ingest.py to build it."
            )
            return
        try:
            self.db = FAISS.load_local(
                FAISS_PATH,
                _get_embeddings(),
                allow_dangerous_deserialization=True,
            )
            logger.info("Global RAG index loaded.")
        except Exception as e:
            logger.error(f"Failed to load FAISS index: {e}")

    def retrieve(self, query: str, k: int = 3) -> str:
        if self.db is None:
            return ""
        docs = self.db.similarity_search(query, k=k)
        return "\n\n".join(
            f"[{d.metadata.get('source', 'corpus')}]: {d.page_content}"
            for d in docs
        )

    def is_ready(self) -> bool:
        return self.db is not None


class SessionRetriever:
    """
    Per-session retriever built from a single uploaded document.
    Used by the chatbot to answer questions about the specific document.
    """

    # In-memory store: session_id → FAISS db
    _sessions: dict = {}

    @classmethod
    def build(cls, session_id: str, text: str) -> "SessionRetriever":
        splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=60)
        docs     = splitter.create_documents(
            [text], metadatas=[{"source": "uploaded_document"}]
        )
        db = FAISS.from_documents(docs, _get_embeddings())
        cls._sessions[session_id] = db
        logger.info(f"Session index built for '{session_id}' ({len(docs)} chunks).")
        instance = cls.__new__(cls)
        instance.session_id = session_id
        return instance

    @classmethod
    def load(cls, session_id: str) -> "SessionRetriever | None":
        if session_id not in cls._sessions:
            return None
        instance = cls.__new__(cls)
        instance.session_id = session_id
        return instance

    def retrieve(self, query: str, k: int = 4) -> str:
        db = self._sessions.get(self.session_id)
        if db is None:
            return ""
        docs = db.similarity_search(query, k=k)
        return "\n\n".join(d.page_content for d in docs)
