from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from pathlib import Path

CORPUS_DIR = "rag/legal_corpus"
FAISS_PATH = "rag/faiss_index"

def build_index():
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=80)
    docs = []

    txt_files = list(Path(CORPUS_DIR).glob("*.txt"))

    if not txt_files:
        print(f"ERROR: No .txt files found in '{CORPUS_DIR}/'")
        print("Add at least one .txt file to the corpus folder and re-run.")
        return

    print(f"Found {len(txt_files)} file(s): {[f.name for f in txt_files]}")

    for path in txt_files:
        text = path.read_text(encoding="utf-8", errors="replace")
        if not text.strip():
            print(f"  WARNING: '{path.name}' is empty, skipping.")
            continue
        chunks = splitter.create_documents(
            [text],
            metadatas=[{"source": path.name}]
        )
        docs.extend(chunks)
        print(f"  Loaded '{path.name}' → {len(chunks)} chunks")

    if not docs:
        print("ERROR: All files were empty. Nothing to index.")
        return

    print(f"\nEmbedding {len(docs)} chunks...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    db = FAISS.from_documents(docs, embeddings)
    db.save_local(FAISS_PATH)
    print(f"Index saved to '{FAISS_PATH}'. Done.")

if __name__ == "__main__":
    build_index()