import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import SessionLocal, Base, engine
from models.user import User
from models.document import Document
from models.workflow import Workflow
from models.requirement import Requirement
from models.action import Action
from models.audit_log import AuditLog
from datetime import datetime, timedelta

# Must import workflows so registry gets populated
import workflows as wf_module
from workflows.registry import registry


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # --- Demo User ---
    user = db.query(User).filter(User.email == "demo@example.com").first()
    if not user:
        user = User(email="demo@example.com", full_name="Demo User")
        db.add(user)
        db.commit()
        db.refresh(user)
    print(f"✓ User: {user.full_name} (id={user.id})")

    # --- Demo Documents ---
    demo_docs = [
        {"name": "Passport_Copy.pdf",       "doc_type": "Passport",       "status": "Valid",   "expiry": datetime.utcnow() + timedelta(days=5*365)},
        {"name": "BankStatement_Aug.pdf",   "doc_type": "Bank Statement", "status": "Valid",   "expiry": None},
        {"name": "Passport_Photo.jpg",      "doc_type": "Passport Photo", "status": "Valid",   "expiry": None},
        {"name": "Salary_Slip_Aug.pdf",     "doc_type": "Salary Slips",   "status": "Valid",   "expiry": None},
        {"name": "Aadhaar_Card.pdf",        "doc_type": "Identity Proof", "status": "Valid",   "expiry": None},
    ]
    for d in demo_docs:
        existing = db.query(Document).filter(Document.name == d["name"], Document.user_id == user.id).first()
        if not existing:
            doc = Document(
                name=d["name"],
                file_path=f"./uploads/{d['name']}",
                doc_type=d["doc_type"],
                status=d["status"],
                expiry_date=d["expiry"],
                user_id=user.id,
            )
            db.add(doc)
            print(f"  ✓ Document: {d['name']}")
    db.commit()

    # --- Schengen Visa Workflow (partially complete) ---
    existing_wf = db.query(Workflow).filter(
        Workflow.user_id == user.id,
        Workflow.workflow_type == "SCHENGEN_VISA"
    ).first()

    if not existing_wf:
        schengen_def = registry.get_workflow("SCHENGEN_VISA")
        wf = Workflow(
            domain="travel_immigration",
            name="Schengen Visa",
            workflow_type="SCHENGEN_VISA",
            status="Active",
            progress=37.5,
            user_id=user.id,
            created_at=datetime.utcnow() - timedelta(days=2),
        )
        db.add(wf)
        db.commit()
        db.refresh(wf)
        print(f"  ✓ Workflow: {wf.name} (id={wf.id})")

        # Requirements — 3 available, 5 missing
        req_statuses = {
            "Passport": "AVAILABLE",
            "Passport Photo": "AVAILABLE",
            "Bank Statement": "AVAILABLE",
            "Travel Insurance": "MISSING",
            "Accommodation Proof": "MISSING",
            "Employment Proof": "MISSING",
            "Flight Itinerary": "MISSING",
            "Cover Letter": "MISSING",
        }
        for doc_type, status in req_statuses.items():
            req = Requirement(workflow_id=wf.id, doc_type=doc_type, status=status)
            db.add(req)

        # Actions
        action_statuses = [
            ("Upload Documents",         "COMPLETED"),
            ("Arrange Travel Insurance", "PENDING"),
            ("Generate Cover Letter",    "PENDING"),
            ("Review Application",       "PENDING"),
            ("Submit Visa Application",  "PENDING"),
        ]
        for desc, status in action_statuses:
            act = Action(workflow_id=wf.id, action_type="GENERIC", description=desc, status=status)
            db.add(act)

        # Audit logs
        audit_entries = [
            (datetime.utcnow() - timedelta(days=2, hours=1), "Workflow created: Schengen Visa"),
            (datetime.utcnow() - timedelta(days=2),          "Uploaded document: Passport_Copy.pdf (Type: Passport)"),
            (datetime.utcnow() - timedelta(hours=5),         "Uploaded document: BankStatement_Aug.pdf (Type: Bank Statement)"),
            (datetime.utcnow() - timedelta(hours=4),         "Uploaded document: Passport_Photo.jpg (Type: Passport Photo)"),
            (datetime.utcnow() - timedelta(hours=3),         "Agent identified missing: Travel Insurance, Accommodation Proof, Employment Proof"),
            (datetime.utcnow() - timedelta(hours=2),         "Agent generated action plan for Schengen Visa"),
            (datetime.utcnow() - timedelta(hours=1),         "Action completed: Upload Documents"),
        ]
        for ts, msg in audit_entries:
            log = AuditLog(workflow_id=wf.id, user_id=user.id, action_description=msg, created_at=ts)
            db.add(log)

        db.commit()
        print(f"  ✓ Seeded requirements, actions, and audit logs")

    print("\n✅ Database seeded successfully!")


if __name__ == "__main__":
    seed()
