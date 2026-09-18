from typing import TypedDict, List, Dict, Any

class AgentState(TypedDict):
    """Shared state passed between all agents in the graph."""
    # Input
    user_message: str
    chat_history: List[Dict[str, str]]
    domain: str
    user_id: int
    user_documents: List[Any]  # SQLAlchemy Document models or dictionaries
    
    # Domain Expert output
    requirements: List[Dict[str, str]]  # [{'name': '', 'reason': '', 'mandatory': True}]
    
    # Document Analyst output
    analyzed_documents: List[Dict[str, Any]]  # [{'doc_type': '', 'holder_name': '', 'expiry': '', 'is_valid': True}]
    
    # Compliance Checker output
    compliance_report: List[Dict[str, Any]]  # [{'requirement': '', 'status': '', 'matched_doc': '', 'warnings': ''}]
    overall_readiness: float  # 0.0 to 100.0
    
    # Action Planner output
    action_plan: List[str]  # ['Step 1...', 'Step 2...']
    
    # Final
    reply: str  # Conversational response to user
    agent_trace: List[Dict[str, Any]]  # [{'agent': 'Domain Expert', 'duration_ms': 100, 'summary': '...'}]
