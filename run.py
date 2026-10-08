import uvicorn
import os
import sys

def main():
    print("=" * 70)
    print("Starting LexClear - AI Legal Document Platform")
    print("   Application URL : http://127.0.0.1:8000")
    print("   API Swagger Docs: http://127.0.0.1:8000/docs")
    print("   Health Endpoint : http://127.0.0.1:8000/api/health")
    print("=" * 70)
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)

if __name__ == "__main__":
    main()
