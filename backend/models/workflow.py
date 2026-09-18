from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, index=True)
    name = Column(String, index=True)
    workflow_type = Column(String)
    status = Column(String)
    progress = Column(Float, default=0.0)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    requirements = relationship("Requirement", back_populates="workflow")
    actions = relationship("Action", back_populates="workflow")
    audit_logs = relationship("AuditLog", back_populates="workflow")
