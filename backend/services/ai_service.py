import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from core.config import settings

class RequirementItem(BaseModel):
    name: str = Field(description="The name of the required document")
    status: str = Field(description="Must be exactly 'AVAILABLE' or 'MISSING'")
    reason: str = Field(description="Brief reason why this document is required based on the user's specific context")

class WorkflowState(BaseModel):
    goal: str = Field(description="The specific goal the user is trying to achieve (e.g., 'F-1 Student Visa (USA)')")
    requirements: List[RequirementItem] = Field(description="Comprehensive list of ALL documents needed for this goal, marking them AVAILABLE if the user mentioned they have them, otherwise MISSING")
    actions_needed: List[str] = Field(description="Next logical steps for the user to take")

class ChatResponse(BaseModel):
    reply: str = Field(description="Your conversational response to the user. Be helpful, professional, and act as an expert agent for their specific bureaucracy domain.")
    state: WorkflowState = Field(description="The structured data representing the current state of their application")

def process_chat(domain: str, message: str, history: List[Dict[str, str]], user_documents: List[str] = None) -> Dict[str, Any]:
    """
    Process a conversational turn using Gemini Structured Output.
    Maintains context from history and dynamically generates document requirements.
    """
    if user_documents is None:
        user_documents = []
    
    # Build a string of user's uploaded documents for the prompt
    vault_info = ""
    if user_documents:
        vault_info = f"""
IMPORTANT - USER'S DOCUMENT VAULT (already uploaded):
The user has already uploaded the following documents to their secure vault. Mark any matching requirements as 'AVAILABLE':
{chr(10).join(f'  - {doc}' for doc in set(user_documents))}
"""
    
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
        try:
            import time
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            # Build conversation string
            conv_text = ""
            for h in history:
                conv_text += f"{h['role'].upper()}: {h['content']}\n"
            conv_text += f"USER: {message}\n"

            prompt = f"""
You are an expert Bureaucracy Management Agent specializing in the domain: '{domain}'.
Your job is to help the user navigate their bureaucratic process (e.g., visas, loans, property registration) by figuring out EXACTLY what documents they need, and tracking what they already have.

{vault_info}

CONVERSATION HISTORY:
{conv_text}

INSTRUCTIONS:
1. Understand the user's ultimate goal from the conversation.
2. Dynamically determine ALL the documents they will need for that specific goal using your expert knowledge.
3. Compare the required documents against what the user has explicitly stated they possess AND the documents already in their vault (listed above). Mark those as AVAILABLE.
4. Respond conversationally to their latest message. If their goal is unclear, ask clarifying questions. If they are missing documents, tell them what to get next. If they already have documents in their vault, acknowledge that.

Output MUST conform to the JSON schema provided.
"""
            # Try multiple models with retries to handle 503 overload
            MODELS_TO_TRY = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.8-flash", "gemini-flash-latest"]
            last_error = None

            for model_name in MODELS_TO_TRY:
                for attempt in range(3):
                    try:
                        print(f"[AI Service] Trying {model_name} (attempt {attempt + 1})")
                        response = client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                            config={
                                "response_mime_type": "application/json",
                                "response_schema": ChatResponse,
                            }
                        )
                        raw = response.text.strip()
                        # Strip markdown code fences if present
                        if raw.startswith("```"):
                            raw = raw.split("```")[1]
                            if raw.startswith("json"):
                                raw = raw[4:]
                        result = json.loads(raw)
                        print(f"[AI Service] Success with {model_name}")
                        return result
                    except Exception as e:
                        last_error = e
                        err_str = str(e)
                        if "503" in err_str or "UNAVAILABLE" in err_str:
                            print(f"[AI Service] {model_name} overloaded (attempt {attempt + 1}), retrying...")
                            time.sleep(1 + attempt)  # back off 1s, 2s, 3s
                            continue
                        elif "404" in err_str:
                            print(f"[AI Service] {model_name} not available, trying next model...")
                            break  # skip to next model
                        else:
                            print(f"[AI Service] {model_name} error: {e}")
                            break  # skip to next model

            print(f"[AI Service] All models failed. Last error: {last_error}, using fallback")
        except Exception as e:
            print(f"[AI Service] Gemini setup error: {e}, using fallback")

    return _fallback_chat(domain, message)


def _fallback_chat(domain: str, message: str) -> Dict[str, Any]:
    """Deterministic fallback if API key is missing or fails."""
    text_lower = message.lower()
    
    goal = f"General {domain} Application"
    requirements = [
        {"name": "Identity Proof (Passport/ID)", "status": "MISSING", "reason": "Standard requirement"},
        {"name": "Proof of Address", "status": "MISSING", "reason": "Standard requirement"}
    ]
    
    if "student" in text_lower or "university" in text_lower or "master" in text_lower:
        goal = "Student Visa / University Admission"
        requirements = [
            {"name": "Valid Passport", "status": "MISSING", "reason": "Required for international travel"},
            {"name": "University Admission Letter", "status": "MISSING", "reason": "Proof of acceptance"},
            {"name": "Financial Proof (Bank Statements)", "status": "MISSING", "reason": "To prove ability to pay tuition"}
        ]
        
    # Mark available if mentioned
    for req in requirements:
        if any(word in text_lower for word in req["name"].lower().split()):
            req["status"] = "AVAILABLE"

    return {
        "reply": f"I see you need help with {domain}. (Note: This is a fallback response because the Gemini API key is not configured. For the full dynamic experience, please add your API key).",
        "state": {
            "goal": goal,
            "requirements": requirements,
            "actions_needed": ["Upload missing documents", "Review application"]
        }
    }

def analyze_intent(text: str) -> Dict[str, Any]:
    """Dummy function to prevent import errors from old routes."""
    return {"workflow": "SCHENGEN_VISA", "entities": {}, "requested_services": [], "summary": ""}

