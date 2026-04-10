files = {
    "orchestrator/__init__.py": "from .orchestrator import Orchestrator\n\n__all__ = ['Orchestrator']\n",
    "schemas/__init__.py": "from .schemas import ClauseResult, DocumentReport\n\n__all__ = ['ClauseResult', 'DocumentReport']\n",
    "rag/__init__.py": "from .retriever import RAGRetriever\n\n__all__ = ['RAGRetriever']\n",
    "agents/__init__.py": "",
}

for path, content in files.items():
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed: {path}")

print("All done")