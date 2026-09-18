from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.db import get_db
from agents.orchestrator import AgentOrchestrator

router = APIRouter()

class AnalyzeRequest(BaseModel):
    text: str
    user_id: int = 1

@router.post("/analyze")
def analyze_request(req: AnalyzeRequest, db: Session = Depends(get_db)):
    orchestrator = AgentOrchestrator(db)
    result = orchestrator.process_request(req.text, req.user_id)
    return result
