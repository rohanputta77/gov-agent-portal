from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    file_path = Column(String)
    doc_type = Column(String, index=True)
    status = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User")
