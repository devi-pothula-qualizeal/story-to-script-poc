from app.graph.state import WorkflowState


def playwright_agent(state: WorkflowState) -> WorkflowState:

    state["playwright_script"] = """
test('Valid Login', async ({ page }) => {
    await page.goto('/login');
});
"""
    print("Executing Playwright Agent")
    return state

