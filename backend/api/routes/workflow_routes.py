from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from models.workflow import Workflow
from models.requirement import Requirement
from models.action import Action
from models.audit_log import AuditLog
from workflows.registry import registry
from datetime import datetime

router = APIRouter()

@router.get("/user/{user_id}")
def get_user_workflows(user_id: int, db: Session = Depends(get_db)):
    workflows = db.query(Workflow).filter(Workflow.user_id == user_id).all()
    result = []
    for wf in workflows:
        requirements = db.query(Requirement).filter(Requirement.workflow_id == wf.id).all()
        actions = db.query(Action).filter(Action.workflow_id == wf.id).all()
        result.append({
            "id": wf.id,
            "name": wf.name,
            "domain": wf.domain,
            "workflow_type": wf.workflow_type,
            "status": wf.status,
            "progress": wf.progress,
            "created_at": wf.created_at.isoformat(),
            "requirements": [{"doc_type": r.doc_type, "status": r.status} for r in requirements],
            "actions": [{"id": a.id, "description": a.description, "status": a.status} for a in actions],
        })
    return result

@router.get("/{workflow_id}/requirements")
def get_requirements(workflow_id: int, db: Session = Depends(get_db)):
    reqs = db.query(Requirement).filter(Requirement.workflow_id == workflow_id).all()
    return reqs

@router.get("/{workflow_id}/actions")
def get_actions(workflow_id: int, db: Session = Depends(get_db)):
    actions = db.query(Action).filter(Action.workflow_id == workflow_id).all()
    return actions

@router.post("/{action_id}/actions/complete")
def complete_action(action_id: int, db: Session = Depends(get_db)):
    action = db.query(Action).filter(Action.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    action.status = "COMPLETED"

    # Recalculate workflow progress
    wf = db.query(Workflow).filter(Workflow.id == action.workflow_id).first()
    if wf:
        all_actions = db.query(Action).filter(Action.workflow_id == wf.id).all()
        completed = sum(1 for a in all_actions if a.status == "COMPLETED")
        
        all_reqs = db.query(Requirement).filter(Requirement.workflow_id == wf.id).all()
        available = sum(1 for r in all_reqs if r.status == "AVAILABLE")
        
        total = len(all_actions) + len(all_reqs)
        wf.progress = ((completed + available) / total) * 100 if total > 0 else 0

        audit = AuditLog(
            workflow_id=wf.id,
            user_id=wf.user_id,
            action_description=f"Action completed: {action.description}"
        )
        db.add(audit)

    db.commit()
    db.refresh(action)
    return {"message": "Action marked as complete", "action": {"id": action.id, "status": action.status}}

@router.post("/{workflow_id}/create-plan")
def create_plan(workflow_id: int, db: Session = Depends(get_db)):
    """Mock: simulates plan creation / application submission."""
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    wf.status = "Submitted"
    audit = AuditLog(
        workflow_id=wf.id,
        user_id=wf.user_id,
        action_description=f"Application submitted for: {wf.name} (simulated)"
    )
    db.add(audit)
    db.commit()
    return {"message": f"Application submitted successfully (simulated). Reference: DEMO-{workflow_id:04d}", "status": "Submitted"}

@router.get("/definitions")
def get_workflow_definitions():
    """Return all registered workflow definitions."""
    return [
        {
            "workflow_type": wf.workflow_type,
            "domain": wf.domain,
            "name": wf.name,
            "description": wf.description,
            "required_documents": wf.required_documents,
            "actions": wf.actions,
        }
        for wf in registry.get_all()
    ]
