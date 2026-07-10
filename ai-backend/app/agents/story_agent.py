from app.graph.state import WorkflowState


def story_agent(state: WorkflowState) -> WorkflowState:

    state["refined_user_story"] = f"""
Title: User Login

User Story:
As a registered user,
I want to log in using my email and password,
So that I can securely access my dashboard.

Acceptance Criteria:
{state["acceptance_criteria"]}
"""
    print("Executing Story Agent")
    return state