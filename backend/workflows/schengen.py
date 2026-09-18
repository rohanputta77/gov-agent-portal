from .base import WorkflowDefinition
from .registry import registry

schengen_workflow = WorkflowDefinition(
    workflow_type="SCHENGEN_VISA",
    domain="travel_immigration",
    name="Schengen Visa",
    description="Application process for a Schengen Visa for traveling to Europe.",
    required_documents=[
        "Passport",
        "Passport Photo",
        "Bank Statement",
        "Travel Insurance",
        "Accommodation Proof",
        "Employment Proof",
        "Flight Itinerary",
        "Cover Letter"
    ],
    optional_documents=[],
    actions=[
        "Upload Documents",
        "Arrange Travel Insurance",
        "Generate Cover Letter",
        "Review Application",
        "Submit Visa Application"
    ]
)

registry.register(schengen_workflow)
