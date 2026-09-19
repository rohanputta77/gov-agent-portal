from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import get_db
from models.audit_log import AuditLog

from models.user import User
from api.deps import get_current_user

router = APIRouter()

@router.get("")
@router.get("/")
def get_audit_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(AuditLog)\
        .filter(AuditLog.user_id == current_user.id)\
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
