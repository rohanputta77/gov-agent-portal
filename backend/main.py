from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from database.db import engine, Base
import models
from api.routes import workflow_routes, documents, agent, audit_logs, chat
import workflows as wf_module  # triggers registration of all workflow definitions

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered bureaucracy management agent for visas, loans, tax registration and more.",
    version="1.0.0"
)

# Parse CORS origins
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

if "*" in origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False, # Credentials not allowed with wildcard
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# API Routers
app.include_router(workflow_routes.router, prefix=f"{settings.API_V1_STR}/workflows", tags=["workflows"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["documents"])
app.include_router(agent.router, prefix=f"{settings.API_V1_STR}/agent", tags=["agent"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(audit_logs.router, prefix=f"{settings.API_V1_STR}/audit-logs", tags=["audit-logs"])

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API", "docs": "/docs"}
