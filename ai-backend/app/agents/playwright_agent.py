import re

from openai import (
    APIConnectionError,
    APITimeoutError,
    AuthenticationError,
    NotFoundError,
    OpenAI,
    OpenAIError,
    RateLimitError,
)

from app.core.config import get_settings
from app.graph.state import WorkflowState


class PlaywrightAgentError(Exception):
    """Raised for any Agent 3 failure. `error_code` lets callers branch on it."""

    def __init__(self, message: str, error_code: str):
        super().__init__(message)
        self.message = message
        self.error_code = error_code


def _format_test_case(test_case: dict) -> str:
    """Render a single structured test case as readable text for the model."""
    steps = test_case.get("steps") or []
    step_lines = [
        f"  {i}. {step}" for i, step in enumerate(steps, start=1)
    ]

    return "\n".join(
        [
            f"ID: {test_case.get('id', '')}",
            f"Scenario: {test_case.get('scenario', '')}",
            f"Preconditions: {test_case.get('preconditions', '')}",
            "Test Steps:",
            *step_lines,
            f"Expected Result: {test_case.get('expected_result', '')}",
            f"Priority: {test_case.get('priority', '')}",
            f"Test Type: {test_case.get('test_type', '')}",
            f"Traceability: {test_case.get('traceability', '')}",
        ]
    )


def _select_first_test_case(test_cases) -> str:
    """
    Accept Agent 2's list of test cases and return the first entry as text
    for Playwright generation.
    """

    if test_cases is None:
        raise PlaywrightAgentError(
            "No test cases were found on the workflow state.", "missing_test_cases"
        )

    if not isinstance(test_cases, list):
        raise PlaywrightAgentError(
            f"Expected test_cases to be a list, got {type(test_cases).__name__}.",
            "invalid_test_cases_type",
        )

    if not test_cases:
        raise PlaywrightAgentError(
            "Test cases list is empty.", "empty_test_cases"
        )

    first = test_cases[0]

    if not isinstance(first, dict):
        raise PlaywrightAgentError(
            f"Expected each test case to be a dict, got {type(first).__name__}.",
            "invalid_test_cases_type",
        )

    if not first.get("id") or not first.get("scenario") or not first.get("steps"):
        raise PlaywrightAgentError(
            "First test case is missing required fields (id, scenario, or steps).",
            "test_cases_unrecognized_format",
        )

    return _format_test_case(first)


def _validate_output(script: str) -> str:
    """Make sure the model actually returned usable Playwright/TS code."""

    cleaned = script.strip()

    # in case the model ignores "no code fences" instructions
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    if not cleaned:
        raise PlaywrightAgentError(
            "OpenAI returned an empty script.", "empty_model_output"
        )

    if "@playwright/test" not in cleaned:
        raise PlaywrightAgentError(
            "Model output does not import '@playwright/test' — does not look "
            "like a valid Playwright script.",
            "invalid_script_output",
        )

    if not re.search(r"\btest\s*\(", cleaned):
        raise PlaywrightAgentError(
            "Model output does not contain a test() block.",
            "invalid_script_output",
        )

    return cleaned


def playwright_agent(state: WorkflowState) -> WorkflowState:
    print("Executing Playwright Agent")

    # 1. take the first test case from Agent 2's list
    test_case = _select_first_test_case(state.get("test_cases"))

    # 2. validate config (build client here, not at import time, so a missing
    #    key doesn't crash the whole app on startup)
    settings = get_settings()
    if not settings.openai_api_key:
        raise PlaywrightAgentError(
            "OPENAI_API_KEY is not configured.", "openai_not_configured"
        )

    client = OpenAI(api_key=settings.openai_api_key)

    prompt = f"""
You are a Senior QA Automation Engineer specializing in Playwright and TypeScript.

Your task is to convert the following approved manual test case into a production-ready Playwright automation script.

Requirements:
- Use @playwright/test.
- Generate exactly one test() block.
- Use TypeScript.
- Follow Playwright best practices.
- Use async/await.
- Include meaningful assertions based on the expected result.
- Use clear and descriptive test names.
- Generate clean, maintainable, and readable code.
- Avoid unnecessary waits.
- Do not invent additional test scenarios.
- Return ONLY executable TypeScript code.
- Do NOT return markdown.
- Do NOT return explanations.
- Do NOT include code fences.
- Assume selectors may need placeholders if they cannot be inferred.

Approved Test Case:

{test_case}
"""

    # 3. call OpenAI with real error handling
    try:
        response = client.responses.create(
            model=settings.openai_model,
            input=prompt,
        )
    except AuthenticationError as exc:
        raise PlaywrightAgentError(
            "OpenAI rejected the configured API key.", "openai_auth_failed"
        ) from exc
    except RateLimitError as exc:
        raise PlaywrightAgentError(
            "OpenAI rate limit reached.", "openai_rate_limit"
        ) from exc
    except NotFoundError as exc:
        raise PlaywrightAgentError(
            f"Model '{settings.openai_model}' is unavailable.",
            "openai_model_unavailable",
        ) from exc
    except (APIConnectionError, APITimeoutError) as exc:
        raise PlaywrightAgentError(
            "Could not reach OpenAI.", "openai_connection_failed"
        ) from exc
    except OpenAIError as exc:
        raise PlaywrightAgentError(
            f"OpenAI request failed: {exc}", "openai_not_ready"
        ) from exc

    output_text = getattr(response, "output_text", None)
    if output_text is None:
        raise PlaywrightAgentError(
            "OpenAI response had no output_text.", "empty_model_output"
        )

    # 4. validate output before trusting it
    state["playwright_script"] = _validate_output(output_text)

    print("Playwright script generated successfully.")

    return state
