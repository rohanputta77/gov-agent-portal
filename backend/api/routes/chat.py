from fastapi import APIRouter, HTTPException, Depends
import json
from pydantic import BaseModel
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from database.db import get_db
from models.document import Document
from models.chat_session import ChatSession
from models.workflow import Workflow
from models.requirement import Requirement
from models.action import Action
from agents.graph import app
from agents.state import AgentState

from models.user import User
from api.deps import get_current_user

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    domain: str
    message: str
    history: List[ChatMessage] = []

@router.get("/history/{domain}")
def get_chat_history(domain: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.user_id == current_user.id, ChatSession.domain == domain).first()
    if session:
        return {"history": json.loads(session.history)}
    return {"history": []}

@router.post("/")
def chat_with_agent(request: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Load or create ChatSession
        chat_session = db.query(ChatSession).filter(ChatSession.user_id == current_user.id, ChatSession.domain == request.domain).first()
        if not chat_session:
            chat_session = ChatSession(user_id=current_user.id, domain=request.domain, history="[]")
            db.add(chat_session)
            db.commit()
            db.refresh(chat_session)

        # Merge history from request with DB history to be safe (frontend sends full history, but we can trust DB)
        # We will just append the new message to the DB history and use that as the source of truth
        db_history = json.loads(chat_session.history)
        db_history.append({"role": "user", "content": request.message})
        
        # Fetch user's uploaded documents from the Document Vault
        user_docs = db.query(Document).filter(Document.user_id == current_user.id).all()
        
        initial_state: AgentState = {
            "user_message": request.message,
            "chat_history": db_history,
            "domain": request.domain,
            "user_id": current_user.id,
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
        
        reply = result.get("reply", "I processed your request.")
        db_history.append({"role": "assistant", "content": reply})
        chat_session.history = json.dumps(db_history)
        db.commit()

        # Update Document statuses based on analysis
        analyzed_docs = result.get("analyzed_documents", [])
        for ad in analyzed_docs:
            doc_type = ad.get("doc_type")
            is_valid = ad.get("is_valid")
            if doc_type and is_valid is not None:
                # Find the matching document in DB (simplistic match by doc_type)
                for doc in user_docs:
                    if doc.doc_type == doc_type:
                        doc.status = "Valid" if is_valid else "Invalid"
        db.commit()

        # Update or Create Workflow summary
        workflow = db.query(Workflow).filter(Workflow.user_id == current_user.id, Workflow.domain == request.domain).first()
        if not workflow:
            workflow = Workflow(
                user_id=current_user.id, 
                domain=request.domain, 
                name=f"{request.domain} Application",
                workflow_type=request.domain,
                status="In Progress"
            )
            db.add(workflow)
            db.commit()
            db.refresh(workflow)

        # Fetch old actions to preserve COMPLETED status
        old_actions = {a.description: a.status for a in db.query(Action).filter(Action.workflow_id == workflow.id).all()}
        
        # Clear old requirements/actions and insert new ones
        db.query(Requirement).filter(Requirement.workflow_id == workflow.id).delete()
        db.query(Action).filter(Action.workflow_id == workflow.id).delete()

        available_count = 0
        total_items = 0

        frontend_reqs = []
        for req in result.get("compliance_report", []):
            req_name = req.get("requirement")
            req_status = req.get("status")
            if req_status == "AVAILABLE":
                available_count += 1
            total_items += 1
            db.add(Requirement(workflow_id=workflow.id, doc_type=req_name, status=req_status))
            frontend_reqs.append({
                "name": req_name,
                "status": req_status,
                "reason": req.get("warnings") or "Required"
            })
            
        completed_actions = 0
        for act in result.get("action_plan", []):
            # Preserve status if it was completed before
            act_status = old_actions.get(act, "PENDING")
            if act_status == "COMPLETED":
                completed_actions += 1
            total_items += 1
            db.add(Action(workflow_id=workflow.id, description=act, status=act_status))
            
        workflow.progress = ((available_count + completed_actions) / total_items) * 100 if total_items > 0 else 0
        
        db.commit()

        return {
            "reply": reply,
            "state": {
                "goal": f"{request.domain} Application",
                "requirements": frontend_reqs,
                "actions_needed": result.get("action_plan", [])
            },
            "agent_trace": result.get("agent_trace", [])
        }
    except Exception as e:
        print(f"Error in chat_with_agent: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
