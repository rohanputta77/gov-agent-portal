from typing import Dict, Any
import time
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from core.config import settings
import json

class ActionPlanResponse(BaseModel):
    reply: str = Field(description="A helpful, conversational response to the user summarizing their status and what they need to do next.")
    action_plan: list[str] = Field(description="A prioritized list of next steps for the user.")

def action_planner_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    start_time = time.time()
    
    compliance_report = state.get("compliance_report", [])
    user_message = state.get("user_message", "")
    domain = state.get("domain", "")
    
    llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0.7, api_key=settings.GEMINI_API_KEY)
    
    comp_json = json.dumps(compliance_report, indent=2)
    
    # Also grab chat history for context
    history_str = ""
    for h in state.get("chat_history", []):
        history_str += f"{h['role'].upper()}: {h['content']}\n"
        
    prompt = f"""
    You are an Action Planner and the final conversational voice of the Bureaucracy Agent for the '{domain}' domain.
    
    CHAT HISTORY:
    {history_str}
    USER'S LATEST MESSAGE: {user_message}
    
    COMPLIANCE REPORT (Readiness: {state.get("overall_readiness", 0)}%):
    {comp_json}
    
    Your job:
    1. Create a prioritized list of next steps (action_plan) based on the missing/expired items in the compliance report.
    2. Write a helpful, conversational 'reply' to the user. Acknowledge what they said, tell them what they are missing or what is ready, and instruct them to follow the next steps.
    """
    
    try:
        response = llm.with_structured_output(ActionPlanResponse).invoke(prompt)
        reply = response.reply
        plan = response.action_plan
    except Exception as e:
        print(f"[Action Planner] Error: {e}")
        reply = "I've analyzed your requirements, but had trouble generating the next steps. Please review your document vault."
        plan = ["Upload missing documents", "Review application"]
        
    duration = int((time.time() - start_time) * 1000)
    
    return {
        "reply": reply,
        "action_plan": plan,
        "agent_trace": state.get("agent_trace", []) + [{
            "agent": "Action Planner",
            "duration_ms": duration,
            "summary": f"Created {len(plan)}-step action plan and formulated response"
        }]
    }
