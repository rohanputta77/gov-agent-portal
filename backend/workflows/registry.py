from .base import WorkflowDefinition

class WorkflowRegistry:
    def __init__(self):
        self._workflows = {}

    def register(self, workflow: WorkflowDefinition):
        self._workflows[workflow.workflow_type] = workflow

    def get_workflow(self, workflow_type: str) -> WorkflowDefinition:
        return self._workflows.get(workflow_type)
        
    def get_all(self):
        return list(self._workflows.values())

registry = WorkflowRegistry()
