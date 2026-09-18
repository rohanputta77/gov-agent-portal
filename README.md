# Bureaucracy Management Agent

> AI-powered prototype to navigate bureaucratic processes — visas, loans, tax registration and more.
> Built for hackathon demo.

---

## Quick Start

### Option A — One Click (Windows)
Double-click `start_demo.bat`

### Option B — Manual

**Backend (Terminal 1):**
```bash
cd backend
.\venv\Scripts\activate        # Windows
uvicorn main:app --reload --port 8000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:**      http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## Configuration (Optional)

To enable real Gemini AI extraction, add your API key to `backend/.env`:
```
GEMINI_API_KEY=your_key_here
```
The app works fully without it using smart keyword fallbacks.

---

## Project Structure

```
Orion2/
├── backend/
│   ├── agents/orchestrator.py      # AI agent brain
│   ├── api/routes/                 # REST endpoints
│   ├── core/config.py              # Settings
│   ├── database/
│   │   ├── db.py                   # SQLite + SQLAlchemy
│   │   └── seed.py                 # Demo data
│   ├── models/                     # DB models
│   ├── services/ai_service.py      # Gemini integration
│   ├── workflows/                  # Workflow registry
│   │   ├── registry.py
│   │   ├── schengen.py
│   │   ├── home_loan.py
│   │   └── gst_registration.py
│   └── main.py
│
└── frontend/
    ├── src/
    │   ├── components/             # Reusable UI components
    │   ├── pages/                  # Page-level views
    │   └── services/api.ts         # API client
    └── index.html
```

---

## Supported Workflows

| Workflow | Domain | Trigger Words |
|---|---|---|
| Schengen Visa | Travel & Immigration | visa, europe, trip, schengen |
| Home Loan | Finance & Banking | loan, mortgage, home, lakh |
| GST Registration | Tax & Compliance | gst, tax, business, freelance |

**Adding a new workflow:** Create `backend/workflows/my_workflow.py` and register it — the dashboard and document vault automatically support it.

---

## Demo Script (Hackathon)

1. Open http://localhost:5173
2. Dashboard shows active **Schengen Visa** application at 37.5% progress
3. Type: *"I'm planning a 3-week trip to France, Italy and Germany in December"*
4. Agent Analysis panel appears with extracted entities, requirements, and actions
5. Click "Open Full Workflow" to see the detailed view
6. Mark actions as done, see progress update live
7. Navigate to **Document Vault** to see uploaded documents
8. Navigate to **Activity Log** to see the full audit trail

---

> ⚠️ **Disclaimer:** This is a prototype for demonstration purposes. All workflows are simulated and do not submit to any real government or financial portal. Document requirements are for illustration only and should not be used as legal or financial advice.
