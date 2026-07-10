from app.graph.state import WorkflowState


def testcase_agent(state: WorkflowState) -> WorkflowState:

    story = state["refined_user_story"]

    state["test_cases"] = f"""
Generated Test Cases based on:

{story}

TC001 - Login with valid credentials

TC002 - Login with invalid password

TC003 - Login with empty username

TC004 - Login with empty password
"""
    print("Executing Test Case Agent")
    return state