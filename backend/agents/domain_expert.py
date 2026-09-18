from typing import Dict, Any
import time
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
import json
from core.config import settings

class RequirementItem(BaseModel):
    name: str = Field(description="The name of the required document")
    reason: str = Field(description="Brief reason why this document is required based on the user's specific context")
    mandatory: bool = Field(description="Whether this document is strictly mandatory")

class RequirementsResponse(BaseModel):
    requirements: list[RequirementItem] = Field(description="Comprehensive list of ALL documents needed for this goal")

DOMAIN_PROMPTS = {
    "travel_immigration": "You are an expert immigration consultant. You know visa rules for every country, document requirements, processing times, and common rejection reasons. For Schengen visas: you know the specific requirements per consulate, the 90/180 day rule, and financial proof thresholds.",
    "finance_banking": "You are an expert loan advisor. You know RBI guidelines, CIBIL score requirements, LTV ratios, income multipliers, and documentation needs for home loans, personal loans, and business loans.",
    "tax_compliance": "You are a GST and tax compliance expert. You know GST registration thresholds, composition scheme rules, input tax credit rules, and required documents for different entity types.",
    "domestic": "You are a government services expert. You know the exact documents required for driver's licenses, property registration, and tax filing.",
    "education": "You are an expert education consultant. You know the exact documents needed for university applications, student visas, and education loans.",
    "employment": "You are an HR and employment verification expert. You know the exact documents needed for background checks, work visas, and credential transfers."
}

def domain_expert_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    start_time = time.time()
    domain = state["domain"]
    system_prompt = DOMAIN_PROMPTS.get(domain.lower().replace(" ", "_").replace("&", "").replace("__", "_"), DOMAIN_PROMPTS["domestic"])
    
    llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0, api_key=settings.GEMINI_API_KEY)
    
    prompt = f"""
    {system_prompt}
    
    USER GOAL: {state['user_message']}
    
    Based on the user's goal in the domain of '{domain}', list ALL the required documents.
    Respond with JSON that matches the requested schema.
    """
    
    try:
        response = llm.with_structured_output(RequirementsResponse).invoke(prompt)
        requirements = [{"name": r.name, "reason": r.reason, "mandatory": r.mandatory} for r in response.requirements]
    except Exception as e:
        print(f"[Domain Expert] Error: {e}")
        # Fallback
        requirements = [{"name": "Identity Proof", "reason": "Standard requirement", "mandatory": True}]
        
    duration = int((time.time() - start_time) * 1000)
    
    return {
        "requirements": requirements,
        "agent_trace": state.get("agent_trace", []) + [{
            "agent": "Domain Expert", 
            "duration_ms": duration, 
            "summary": f"Generated {len(requirements)} requirements for {domain}"
        }]
    }
