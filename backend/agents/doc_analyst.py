from typing import Dict, Any
import time
import os
import base64
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from core.config import settings

class ExtractedDocument(BaseModel):
    doc_type: str = Field(description="The type of document (e.g., Passport, Bank Statement)")
    holder_name: str = Field(description="The name of the person on the document, if available", default="")
    expiry_date: str = Field(description="The expiry date of the document, if available (YYYY-MM-DD)", default="")
    is_valid: bool = Field(description="Whether the document appears valid and not expired based on the extracted dates", default=True)

class DocumentAnalysisResponse(BaseModel):
    extracted: list[ExtractedDocument] = Field(description="List of extracted documents")

def _extract_pdf_text(filepath: str) -> str:
    try:
        import PyPDF2
        text = ""
        with open(filepath, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text[:10000] # Limit to 10k chars
    except Exception as e:
        print(f"[Doc Analyst] PDF Extraction error: {e}")
        return ""

def doc_analyst_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    start_time = time.time()
    user_documents = state.get("user_documents", [])
    analyzed = []
    
    if not user_documents:
        return {
            "analyzed_documents": [],
            "agent_trace": state.get("agent_trace", []) + [{
                "agent": "Document Analyst",
                "duration_ms": 0,
                "summary": "No documents uploaded yet"
            }]
        }
        
    llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0, api_key=settings.GEMINI_API_KEY_2, max_retries=1, timeout=10)
    vision_llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0, api_key=settings.GEMINI_API_KEY_2, max_retries=1, timeout=15)
    
    for doc in user_documents:
        filepath = doc.file_path
        if not os.path.exists(filepath):
            continue
            
        ext = os.path.splitext(filepath)[1].lower()
        
        try:
            if ext in ['.png', '.jpg', '.jpeg']:
                with open(filepath, "rb") as f:
                    image_data = base64.b64encode(f.read()).decode()
                
                # Use standard invoke and parse JSON manually or use structured output if supported for multimodal
                response = vision_llm.with_structured_output(ExtractedDocument).invoke([
                    {"type": "text", "text": f"Analyze this image which is claimed to be a {doc.doc_type}. Extract document details."},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}
                ])
                
                analyzed.append({
                    "doc_type": response.doc_type if response.doc_type else doc.doc_type,
                    "holder_name": response.holder_name,
                    "expiry": response.expiry_date,
                    "is_valid": response.is_valid,
                    "original_name": doc.name
                })
                
            elif ext == '.pdf':
                text = _extract_pdf_text(filepath)
                if text:
                    prompt = f"Analyze this text extracted from a PDF claimed to be a {doc.doc_type}. Extract document details:\n\n{text}"
                    response = llm.with_structured_output(ExtractedDocument).invoke(prompt)
                    analyzed.append({
                        "doc_type": response.doc_type if response.doc_type else doc.doc_type,
                        "holder_name": response.holder_name,
                        "expiry": response.expiry_date,
                        "is_valid": response.is_valid,
                        "original_name": doc.name
                    })
                else:
                    analyzed.append({
                        "doc_type": doc.doc_type,
                        "holder_name": "",
                        "expiry": "",
                        "is_valid": True,
                        "original_name": doc.name
                    })
        except Exception as e:
            print(f"[Doc Analyst] Error analyzing {doc.name}: {e}")
            analyzed.append({
                "doc_type": doc.doc_type,
                "holder_name": "",
                "expiry": "",
                "is_valid": True,
                "original_name": doc.name
            })
            
    duration = int((time.time() - start_time) * 1000)
    
    return {
        "analyzed_documents": analyzed,
        "agent_trace": state.get("agent_trace", []) + [{
            "agent": "Document Analyst",
            "duration_ms": duration,
            "summary": f"Analyzed {len(analyzed)} documents using Gemini Vision/Text extraction"
        }]
    }
