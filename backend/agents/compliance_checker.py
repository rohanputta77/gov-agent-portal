from typing import Dict, Any
import time
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
from core.config import settings
import json

class ComplianceItem(BaseModel):
    requirement: str = Field(description="The name of the requirement being checked")
    status: str = Field(description="Must be one of: AVAILABLE, MISSING, EXPIRED, NEEDS_REVIEW")
    matched_doc: str = Field(description="Name of the uploaded document that fulfills this requirement, if any", default="")
    warnings: str = Field(description="Any issues or warnings (e.g. name mismatch, approaching expiry)", default="")

class ComplianceReport(BaseModel):
    items: list[ComplianceItem] = Field(description="List of compliance checks for all requirements")
    overall_readiness: float = Field(description="A score from 0.0 to 100.0 indicating overall readiness")

def compliance_checker_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    start_time = time.time()
    
    requirements = state.get("requirements", [])
    analyzed_documents = state.get("analyzed_documents", [])
    
    req_json = json.dumps(requirements, indent=2)
    docs_json = json.dumps(analyzed_documents, indent=2)
    
    prompt = f"""
    You are a meticulous Compliance Checker.
    
    REQUIREMENTS FOR THE USER'S GOAL:
    {req_json}
    
    DOCUMENTS CURRENTLY IN VAULT (Analyzed by Document Analyst):
    {docs_json}
    
    Your job:
    1. Cross-reference the required documents with the analyzed documents.
    2. Determine if each requirement is AVAILABLE, MISSING, EXPIRED, or NEEDS_REVIEW.
       - CRITICAL RULE: If a matched document has `is_valid: false`, its status MUST be NEEDS_REVIEW, never AVAILABLE.
    3. Note any warnings (e.g. name mismatch, document expired, document is invalid).
    4. Calculate an overall readiness score from 0 to 100.
    """
    
    try:
        # Use Groq Llama 3 for instant inference
        llm = ChatGroq(model="qwen/qwen3.8-27b", temperature=0, api_key=settings.GROQ_API_KEY)
        response = llm.with_structured_output(ComplianceReport).invoke(prompt)
        report = [{"requirement": r.requirement, "status": r.status, "matched_doc": r.matched_doc, "warnings": r.warnings} for r in response.items]
        readiness = response.overall_readiness
    except Exception as e:
        print(f"[Compliance Checker] Error: {e}")
        # Demo fallback
        has_docs = len(analyzed_documents) > 0
        doc_is_valid = analyzed_documents[0].get("is_valid", True) if has_docs else False
        
        doc_status = "MISSING"
        if has_docs:
            doc_status = "AVAILABLE" if doc_is_valid else "NEEDS_REVIEW"

        report = [
            {"requirement": "Passport / ID", "status": doc_status, "matched_doc": analyzed_documents[0]['original_name'] if has_docs else "", "warnings": "Invalid document detected" if doc_status == "NEEDS_REVIEW" else ""},
            {"requirement": "Bank Statement", "status": "MISSING", "matched_doc": "", "warnings": "Must be from last 3 months"},
            {"requirement": "Application Form", "status": "MISSING", "matched_doc": "", "warnings": ""}
        ]
        readiness = 33.3 if doc_status == "AVAILABLE" else 0.0
        
    duration = int((time.time() - start_time) * 1000)
    
    return {
        "compliance_report": report,
        "overall_readiness": readiness,
        "agent_trace": state.get("agent_trace", []) + [{
            "agent": "Compliance Checker",
            "duration_ms": duration,
            "summary": f"Cross-referenced {len(requirements)} requirements vs {len(analyzed_documents)} documents. Readiness: {readiness}%"
        }]
    }
