from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime

class Action(Base):
    __tablename__ = "actions"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    action_type = Column(String)
    description = Column(String)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)

    workflow = relationship("Workflow", back_populates="actions")
