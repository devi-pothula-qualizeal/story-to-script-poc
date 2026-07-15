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
from app.prompts.test_case_prompt import SYSTEM_PROMPT, generate_user_prompt
from app.schemas.test_case import TestCaseOutput


class TestCaseAgentError(Exception):
    """Raised for any Agent 2 failure. `error_code` lets callers branch on it."""

    def __init__(self, message: str, error_code: str):
        super().__init__(message)
        self.message = message
        self.error_code = error_code


def _format_refined_story(refined_user_story: dict) -> str:
    """Convert Agent 1's structured refined story dict into readable text."""
    lines = [
        f"Title: {refined_user_story.get('title', '')}",
        "",
        f"User Story: {refined_user_story.get('user_story', '')}",
        "",
        "Acceptance Criteria:",
    ]
    for i, ac in enumerate(refined_user_story.get("acceptance_criteria", []), start=1):
        lines.append(f"AC{i}: {ac.get('title', '')}")
        lines.append(f"  Given {ac.get('given', '')}")
        lines.append(f"  When {ac.get('when', '')}")
        lines.append(f"  Then {ac.get('then', '')}")
    return "\n".join(lines)


def _format_acceptance_criteria(refined_user_story: dict) -> str:
    """Flatten Agent 1's structured acceptance criteria list into plain text."""
    parts = []
    for ac in refined_user_story.get("acceptance_criteria", []):
        parts.append(
            f"- {ac.get('title', '')}: Given {ac.get('given', '')}, "
            f"When {ac.get('when', '')}, Then {ac.get('then', '')}"
        )
    return "\n".join(parts)


def _validate_refined_story(refined_user_story) -> tuple[str, str]:
    """
    Reject missing, malformed, or not-yet-ready refined stories before it
    burns an API call. Returns (formatted_story_text, formatted_criteria_text).
    """

    if refined_user_story is None:
        raise TestCaseAgentError(
            "No refined user story was found on the workflow state. "
            "Ensure Agent 1 has completed successfully.",
            "missing_refined_story",
        )

    if not isinstance(refined_user_story, dict):
        raise TestCaseAgentError(
            f"Expected refined_user_story to be a dict, got "
            f"{type(refined_user_story).__name__}.",
            "invalid_refined_story_type",
        )

    if refined_user_story.get("needs_clarification"):
        questions = refined_user_story.get("clarification_questions") or []
        raise TestCaseAgentError(
            "The refined user story needs clarification before test cases can "
            "be generated. Open questions: "
            f"{'; '.join(questions) if questions else 'see Agent 1 output'}",
            "story_needs_clarification",
        )

    title = refined_user_story.get("title")
    user_story = refined_user_story.get("user_story")

    if not title or not user_story:
        raise TestCaseAgentError(
            "Refined user story is missing a title or user story text.",
            "incomplete_refined_story",
        )

    acceptance_criteria = refined_user_story.get("acceptance_criteria")

    if not acceptance_criteria or not isinstance(acceptance_criteria, list):
        raise TestCaseAgentError(
            "Refined user story has no acceptance criteria to generate test "
            "cases from.",
            "missing_acceptance_criteria",
        )

    story_text = _format_refined_story(refined_user_story)
    criteria_text = _format_acceptance_criteria(refined_user_story)

    return story_text, criteria_text


def _validate_output(parsed: TestCaseOutput | None) -> list[dict]:
    """Make sure the model returned a usable list of structured test cases."""

    if parsed is None:
        raise TestCaseAgentError(
            "OpenAI returned an empty or unparsable response.",
            "empty_model_output",
        )

    test_cases = [tc.model_dump() for tc in parsed.test_cases]

    if not test_cases:
        raise TestCaseAgentError(
            "Model returned an empty test case list.",
            "invalid_test_case_output",
        )

    for index, tc in enumerate(test_cases):
        if not tc.get("id") or not tc.get("scenario") or not tc.get("steps"):
            raise TestCaseAgentError(
                f"Test case at index {index} is missing required fields "
                "(id, scenario, or steps).",
                "invalid_test_case_output",
            )

    return test_cases


def testcase_agent(state: WorkflowState) -> WorkflowState:
    print("Executing Test Case Agent")

    # 1. validate input
    refined_user_story = state.get("refined_user_story")
    story_text, criteria_text = _validate_refined_story(refined_user_story)

    # 2. validate config (build client here, not at import time, so a missing
    #    key doesn't crash the whole app on startup)
    settings = get_settings()
    if not settings.openai_api_key:
        raise TestCaseAgentError(
            "OPENAI_API_KEY is not configured.", "openai_not_configured"
        )

    client = OpenAI(api_key=settings.openai_api_key)

    user_prompt = generate_user_prompt(story_text, criteria_text)

    # 3. call OpenAI with structured output
    try:
        response = client.chat.completions.parse(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format=TestCaseOutput,
        )
    except AuthenticationError as exc:
        raise TestCaseAgentError(
            "OpenAI rejected the configured API key.", "openai_auth_failed"
        ) from exc
    except RateLimitError as exc:
        raise TestCaseAgentError(
            "OpenAI rate limit reached.", "openai_rate_limit"
        ) from exc
    except NotFoundError as exc:
        raise TestCaseAgentError(
            f"Model '{settings.openai_model}' is unavailable.",
            "openai_model_unavailable",
        ) from exc
    except (APIConnectionError, APITimeoutError) as exc:
        raise TestCaseAgentError(
            "Could not reach OpenAI.", "openai_connection_failed"
        ) from exc
    except OpenAIError as exc:
        raise TestCaseAgentError(
            f"OpenAI request failed: {exc}", "openai_not_ready"
        ) from exc

    parsed = response.choices[0].message.parsed

    # 4. validate output before trusting it
    state["test_cases"] = _validate_output(parsed)

    print("Test cases generated successfully.")

    return state
