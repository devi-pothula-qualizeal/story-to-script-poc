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

# --- tuning knobs -----------------------------------------------------------
MIN_TEST_CASE_LENGTH = 30          # rejects things like "32" or "test"
REQUIRED_SIGNAL_WORDS = (          # a real test case should mention at least
    "step", "given", "when", "then", "expected", "verify", "should",
)


class PlaywrightAgentError(Exception):
    """Raised for any Agent 3 failure. `error_code` lets callers branch on it."""

    def __init__(self, message: str, error_code: str):
        super().__init__(message)
        self.message = message
        self.error_code = error_code


def _validate_test_cases(test_cases) -> str:
    """Reject missing, empty, non-string, or nonsense input before it burns an API call."""

    if test_cases is None:
        raise PlaywrightAgentError(
            "No test cases were found on the workflow state.", "missing_test_cases"
        )

    if not isinstance(test_cases, str):
        raise PlaywrightAgentError(
            f"Expected test_cases to be a string, got {type(test_cases).__name__}.",
            "invalid_test_cases_type",
        )

    cleaned = test_cases.strip()

    if not cleaned:
        raise PlaywrightAgentError(
            "Test cases input is empty or whitespace only.", "empty_test_cases"
        )

    if len(cleaned) < MIN_TEST_CASE_LENGTH:
        raise PlaywrightAgentError(
            f"Test cases input is too short ({len(cleaned)} chars) to be a real "
            f"test case. Expected at least {MIN_TEST_CASE_LENGTH} characters.",
            "test_cases_too_short",
        )

    # purely numeric / symbolic input (e.g. "32", "1234", "----") — no letters at all
    if not re.search(r"[A-Za-z]{3,}", cleaned):
        raise PlaywrightAgentError(
            "Test cases input does not contain recognizable text — it looks "
            "like garbage or a stray number, not a test case.",
            "test_cases_not_textual",
        )

    # loose sanity check: does it look like a test case at all?
    lowered = cleaned.lower()
    if not any(word in lowered for word in REQUIRED_SIGNAL_WORDS):
        raise PlaywrightAgentError(
            "Test cases input doesn't look like a structured test case "
            "(no steps, expected result, or given/when/then found).",
            "test_cases_unrecognized_format",
        )

    return cleaned


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

    # 1. validate input
    test_cases = _validate_test_cases(state.get("test_cases"))

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

{test_cases}
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