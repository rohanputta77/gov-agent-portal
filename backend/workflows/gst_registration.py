from .base import WorkflowDefinition
from .registry import registry

gst_registration_workflow = WorkflowDefinition(
    workflow_type="GST_REGISTRATION",
    domain="tax_compliance",
    name="GST Registration",
    description="Registering for GST compliance for businesses.",
    required_documents=[
        "PAN Card",
        "Aadhaar Card",
        "Proof of Business Registration",
        "Identity and Address Proof of Promoters",
        "Bank Account Statement",
        "Digital Signature"
    ],
    optional_documents=[],
    actions=[
        "Upload Promoters KYC",
        "Upload Business Registration",
        "Upload Bank Proof",
        "Submit GST Application"
    ]
)

registry.register(gst_registration_workflow)
