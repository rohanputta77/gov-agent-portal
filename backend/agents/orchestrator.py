from sqlalchemy.orm import Session
from services.ai_service import analyze_intent
from models.document import Document
from models.workflow import Workflow
from models.requirement import Requirement
from models.action import Action
from models.audit_log import AuditLog
from workflows.registry import registry
from datetime import datetime

class AgentOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        
    def process_request(self, text: str, user_id: int):
        intent = analyze_intent(text)
        workflow_type = intent.get("workflow", "SCHENGEN_VISA")
        
        wf_def = registry.get_workflow(workflow_type)
        if not wf_def:
            wf_def = registry.get_workflow("SCHENGEN_VISA")
            
        db_workflow = self.db.query(Workflow).filter(
            Workflow.user_id == user_id,
            Workflow.workflow_type == wf_def.workflow_type
        ).first()
        
        if not db_workflow:
            db_workflow = Workflow(
                domain=wf_def.domain,
                name=wf_def.name,
                workflow_type=wf_def.workflow_type,
                status="Active",
                user_id=user_id
            )
            self.db.add(db_workflow)
            self.db.commit()
            self.db.refresh(db_workflow)
            
            audit = AuditLog(workflow_id=db_workflow.id, user_id=user_id, action_description=f"Agent identified workflow: {wf_def.name}")
            self.db.add(audit)
            
        user_docs = self.db.query(Document).filter(Document.user_id == user_id).all()
        user_doc_types = {doc.doc_type: doc for doc in user_docs}
        
        requirements_summary = []
        for req_doc in wf_def.required_documents:
            status = "AVAILABLE" if req_doc in user_doc_types else "MISSING"
            
            db_req = self.db.query(Requirement).filter(
                Requirement.workflow_id == db_workflow.id,
                Requirement.doc_type == req_doc
            ).first()
            if not db_req:
                db_req = Requirement(workflow_id=db_workflow.id, doc_type=req_doc, status=status)
                self.db.add(db_req)
            else:
                db_req.status = status
                
            requirements_summary.append({
                "doc_type": req_doc,
                "status": status
            })
            
        actions_summary = []
        for action_desc in wf_def.actions:
            db_act = self.db.query(Action).filter(
                Action.workflow_id == db_workflow.id,
                Action.description == action_desc
            ).first()
            if not db_act:
                db_act = Action(workflow_id=db_workflow.id, action_type="GENERIC", description=action_desc)
                self.db.add(db_act)
            
            actions_summary.append({
                "description": action_desc,
                "status": db_act.status if db_act else "PENDING"
            })
            
        available_count = sum(1 for r in requirements_summary if r["status"] == "AVAILABLE")
        db_workflow.progress = (available_count / len(wf_def.required_documents)) * 100 if wf_def.required_documents else 100
        
        audit_plan = AuditLog(workflow_id=db_workflow.id, user_id=user_id, action_description="Agent generated action plan")
        self.db.add(audit_plan)
        
        self.db.commit()
        
        return {
            "intent": intent,
            "workflow": {
                "id": db_workflow.id,
                "name": wf_def.name,
                "progress": db_workflow.progress,
            },
            "requirements": requirements_summary,
            "actions": actions_summary
        }
