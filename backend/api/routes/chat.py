from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from database.db import get_db
from models.document import Document
from agents.graph import app
from agents.state import AgentState

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
        # Convert Pydantic models to dicts
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        # Fetch user's uploaded documents from the Document Vault
        user_docs = db.query(Document).filter(Document.user_id == request.user_id).all()
        
        initial_state: AgentState = {
            "user_message": request.message,
            "chat_history": history_dicts,
            "domain": request.domain,
            "user_id": request.user_id,
            "user_documents": user_docs,
            "requirements": [],
            "analyzed_documents": [],
            "compliance_report": [],
            "overall_readiness": 0.0,
            "action_plan": [],
            "reply": "",
            "agent_trace": []
        }
        
        result = app.invoke(initial_state)
        
        # Transform the result back into the format expected by the frontend
        # The frontend expects: { reply: str, state: { goal: str, requirements: list, actions_needed: list }, agent_trace: list }
        
        frontend_reqs = []
        for req in result.get("compliance_report", []):
            frontend_reqs.append({
                "name": req.get("requirement"),
                "status": req.get("status"),
                "reason": req.get("warnings") or "Required"
            })
            
        return {
            "reply": result.get("reply", "I processed your request."),
            "state": {
                "goal": f"{request.domain} Application",
                "requirements": frontend_reqs,
                "actions_needed": result.get("action_plan", [])
            },
            "agent_trace": result.get("agent_trace", [])
        }
    except Exception as e:
        print(f"Error in chat_with_agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))
