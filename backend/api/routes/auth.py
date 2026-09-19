from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.db import get_db
from models.user import User
from core.security import create_access_token

router = APIRouter()

class DummyLoginRequest(BaseModel):
    email: str
    name: str = ""

@router.post("/dummy-login")
def dummy_login(request: DummyLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        user = User(email=request.email, full_name=request.name or request.email.split("@")[0])
        db.add(user)
        db.commit()
        db.refresh(user)
        
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "name": user.full_name}}
