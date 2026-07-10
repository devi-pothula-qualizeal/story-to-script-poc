from typing import TypedDict

class WorkflowState(TypedDict):
    description: str
    acceptance_criteria: str

    refined_user_story: str
    test_cases: str
    playwright_script: str