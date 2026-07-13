from typing import Any, TypedDict


class WorkflowState(TypedDict):
    description: str
    acceptance_criteria: str

    refined_user_story: Any
    test_cases: list
    playwright_script: str
