from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from services.ai_service import process_chat
from database.db import get_db
from models.document import Document

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    domain: str
    message: str
    history: List[ChatMessage] = []
    user_id: int = 1

@router.post("/")
def chat_with_agent(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # Convert Pydantic models to dicts for the service layer
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        # Fetch user's uploaded documents from the Document Vault
        user_docs = db.query(Document).filter(Document.user_id == request.user_id).all()
        uploaded_doc_names = [d.doc_type for d in user_docs] + [d.name for d in user_docs]
        
        result = process_chat(
            domain=request.domain,
            message=request.message,
            history=history_dicts,
            user_documents=uploaded_doc_names
        )
        
        # Post-process: cross-reference AI requirements with uploaded documents
        if result.get("state") and result["state"].get("requirements"):
            for req in result["state"]["requirements"]:
                req_name_lower = req["name"].lower()
                for doc_name in uploaded_doc_names:
                    doc_lower = doc_name.lower()
                    # Fuzzy match: if document name overlaps significantly with a requirement
                    if (doc_lower in req_name_lower 
                        or req_name_lower in doc_lower
                        or any(word in req_name_lower for word in doc_lower.split() if len(word) > 3)):
                        req["status"] = "AVAILABLE"
                        if "already in your vault" not in req.get("reason", "").lower():
                            req["reason"] = f"✅ Already in your Document Vault — {req.get('reason', '')}"
                        break
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

