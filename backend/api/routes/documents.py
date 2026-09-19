from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from models.document import Document
from models.audit_log import AuditLog
from core.config import settings
import os, shutil

router = APIRouter()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_SIZE_MB = 10


@router.get("")
@router.get("/")
def list_documents(user_id: int = 1, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.user_id == user_id).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "doc_type": d.doc_type,
            "status": d.status,
            "upload_date": d.upload_date.isoformat(),
            "expiry_date": d.expiry_date.isoformat() if d.expiry_date else None,
        }
        for d in docs
    ]


@router.post("")
@router.post("/")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    user_id: int = Form(1),
    db: Session = Depends(get_db),
):
    try:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {ALLOWED_EXTENSIONS}")

        # Read and check size
        contents = await file.read()
        if len(contents) > MAX_SIZE_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File size exceeds {MAX_SIZE_MB}MB limit")

        safe_filename = f"{user_id}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
        with open(file_path, "wb") as f:
            f.write(contents)

        # Ensure user exists to avoid foreign key violation
        from models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(id=user_id, email=f"user{user_id}@example.com", full_name=f"User {user_id}")
            db.add(user)
            db.commit()

        db_doc = Document(
            name=file.filename,
            file_path=file_path,
            doc_type=doc_type,
            status="Pending Analysis",
            user_id=user_id,
        )
        db.add(db_doc)

        audit = AuditLog(
            user_id=user_id,
            action_description=f"Uploaded document: {file.filename} (Type: {doc_type})"
        )
        db.add(audit)
        db.commit()
        db.refresh(db_doc)

        return {
            "id": db_doc.id,
            "name": db_doc.name,
            "doc_type": db_doc.doc_type,
            "status": db_doc.status,
            "upload_date": db_doc.upload_date.isoformat(),
        }
    except Exception as e:
        import traceback
        raise HTTPException(status_code=400, detail=f"Internal Error: {str(e)}\n{traceback.format_exc()}")


@router.delete("/{document_id}")
def delete_document(document_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == user_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    audit = AuditLog(
        user_id=user_id,
        action_description=f"Deleted document: {doc.name}"
    )
    db.add(audit)
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}
