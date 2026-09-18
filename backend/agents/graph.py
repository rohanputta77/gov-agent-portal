from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.domain_expert import domain_expert_agent
from agents.doc_analyst import doc_analyst_agent
from agents.compliance_checker import compliance_checker_agent
from agents.action_planner import action_planner_agent

def should_analyze_docs(state: AgentState) -> str:
    """Conditional edge: skip doc analysis if no documents uploaded."""
    if len(state.get("user_documents", [])) > 0:
        return "analyze_docs"
    return "check_compliance"

# Build the graph
workflow = StateGraph(AgentState)

# Add nodes (each node = one agent)
workflow.add_node("domain_expert", domain_expert_agent)
workflow.add_node("analyze_docs", doc_analyst_agent)
workflow.add_node("check_compliance", compliance_checker_agent)
workflow.add_node("plan_actions", action_planner_agent)

# Define edges (the flow)
workflow.set_entry_point("domain_expert")
workflow.add_conditional_edges("domain_expert", should_analyze_docs)
workflow.add_edge("analyze_docs", "check_compliance")
workflow.add_edge("check_compliance", "plan_actions")
workflow.add_edge("plan_actions", END)

# Compile
app = workflow.compile()
