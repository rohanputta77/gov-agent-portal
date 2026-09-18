from typing import List

class WorkflowDefinition:
    def __init__(
        self,
        workflow_type: str,
        domain: str,
        name: str,
        description: str,
        required_documents: List[str],
        optional_documents: List[str],
        actions: List[str],
    ):
        self.workflow_type = workflow_type
        self.domain = domain
        self.name = name
        self.description = description
        self.required_documents = required_documents
        self.optional_documents = optional_documents
        self.actions = actions
