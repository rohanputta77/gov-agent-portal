from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import get_db
from models.audit_log import AuditLog

router = APIRouter()

@router.get("/")
def get_audit_logs(user_id: int = 1, db: Session = Depends(get_db)):
    logs = db.query(AuditLog)\
        .filter(AuditLog.user_id == user_id)\
        .order_by(AuditLog.created_at.desc())\
        .limit(50)\
        .all()
    return [
        {
            "id": log.id,
            "workflow_id": log.workflow_id,
            "action_description": log.action_description,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]
