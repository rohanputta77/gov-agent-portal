from .base import WorkflowDefinition
from .registry import registry

home_loan_workflow = WorkflowDefinition(
    workflow_type="HOME_LOAN",
    domain="finance_banking",
    name="Home Loan",
    description="Application for a home loan / mortgage.",
    required_documents=[
        "Identity Proof",
        "Address Proof",
        "Salary Slips",
        "Bank Statements",
        "Employment Proof",
        "Income Documents",
        "Property Documents"
    ],
    optional_documents=[],
    actions=[
        "Upload KYC Documents",
        "Upload Income Proofs",
        "Upload Property Documents",
        "Submit Loan Application"
    ]
)

registry.register(home_loan_workflow)
