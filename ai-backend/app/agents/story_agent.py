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
from app.schemas.story import RefinedUserStory

INVEST_PRINCIPLES = ("independent", "negotiable", "valuable", "estimable", "small", "testable")

REFINE_SYSTEM_PROMPT = """You are an expert Agile Product Owner and QA Lead. Your job is to transform raw, informal feature requests into a single high-quality user story that meets the INVEST standard (Independent, Negotiable, Valuable, Estimable, Small, Testable).

Your output feeds an automated QA pipeline: a downstream agent generates test cases directly from your acceptance criteria, so every criterion must be concrete, unambiguous, and independently verifiable.

### Instructions
1. **Analyze:** Identify the underlying persona, action, and business value in the raw input. Note gaps and ambiguities.
2. **Refine:** Write the story strictly in the format "As a [persona], I want [action], so that [value/benefit]". Focus on the *what* and *why* — leave the *how* (technical implementation) to the development team.
3. **Acceptance Criteria:** Produce scenarios in BDD format:
   - Incorporate and improve any draft criteria supplied — do not silently drop them.
   - Cover the happy path first, then negative paths, then relevant edge cases.
   - One behavior per scenario. Each must have a single, clear pass/fail outcome.
4. **Assumptions:** Populate the `assumptions` field with every gap you filled in steps 1–3 (persona, scope, auth/state, data rules, edge behavior, out-of-scope exclusions). Prefer 2–5 concrete items. Never invent silent requirements — put them in `assumptions` instead. Do not leave `assumptions` empty on a successful refine.
5. **INVEST Scoring:** Critically score the REFINED story against each of the six INVEST principles. For every principle, FIRST write a short `assessment` justifying your judgement (cite a concrete strength or gap in this story), THEN assign a 0-100 `score`. Always reason before you score.

### INVEST Scoring Rubric (apply the SAME anchors to every principle)
- 85-100 (Excellent): Fully satisfies the principle. No meaningful concern.
- 65-84  (Good): Largely satisfies it. Only minor, non-blocking gaps.
- 45-64  (Partial): Satisfied in places, but with notable gaps that need attention.
- 25-44  (Weak): Mostly fails the principle. Significant rework required.
- 0-24   (Absent): Does not satisfy the principle at all.

What each principle means when you score it:
- Independent: Can be delivered on its own, with no hidden dependency on another story.
- Negotiable: Captures the what/why and leaves the how open; contains no baked-in technical solution or UI design.
- Valuable: States explicit value for a specific, named persona — not a vague "user".
- Estimable: Scope is concrete enough that a team could confidently size it.
- Small: Realistically fits inside a single sprint; recommend a split in the assessment if it does not.
- Testable: Acceptance criteria give unambiguous, automatable pass/fail conditions.

Be a strict grader. Reserve scores above 85 for stories that genuinely leave no concern, and never award a high Testable score if any acceptance criterion is vague.

### Constraints
- Do NOT include technical architecture, implementation details, UI layouts, or code (this violates "Negotiable").
- Make the persona specific ("registered user", "store admin") — never just "user" when the input allows better.
- If the input is too vague or nonsensical to derive a business goal, set `needs_clarification` to True, populate `clarification_questions`, leave `assumptions` as an empty list, and leave the story fields and `invest_review` null."""


class StoryAgentError(Exception):
    """Raised for any Agent 1 failure. `error_code` lets callers branch on it."""

    def __init__(self, message: str, error_code: str):
        super().__init__(message)
        self.message = message
        self.error_code = error_code


def _finalize_invest_scores(story: dict) -> None:
    """
    Clamp every INVEST principle score into 0-100 and attach an `overall_score`
    (the mean of the six) so the frontend never has to trust raw model math.
    Mutates `story["invest_review"]` in place; a no-op when there is no review.
    """
    review = story.get("invest_review")
    if not isinstance(review, dict):
        return

    scores: list[int] = []
    for principle in INVEST_PRINCIPLES:
        criterion = review.get(principle)
        if not isinstance(criterion, dict):
            continue
        try:
            value = int(round(float(criterion.get("score", 0))))
        except (TypeError, ValueError):
            value = 0
        value = max(0, min(100, value))
        criterion["score"] = value
        scores.append(value)

    review["overall_score"] = round(sum(scores) / len(scores)) if scores else 0


def _validate_output(parsed: RefinedUserStory | None) -> dict:
    """Reject empty or internally inconsistent model output before trusting it."""

    if parsed is None:
        raise StoryAgentError(
            "OpenAI returned an empty or unparsable response.",
            "empty_model_output",
        )

    story = parsed.model_dump()

    # Clarification path: the story fields are intentionally null, but we must
    # have questions to show the user — otherwise the pipeline dead-ends.
    if story.get("needs_clarification"):
        if not story.get("clarification_questions"):
            raise StoryAgentError(
                "Model requested clarification but returned no questions.",
                "missing_clarification_questions",
            )
        return story

    # Success path: the downstream test-case agent needs all of these.
    if not story.get("title") or not story.get("user_story"):
        raise StoryAgentError(
            "Refined story is missing a title or user story text.",
            "incomplete_refined_story",
        )

    if not story.get("acceptance_criteria"):
        raise StoryAgentError(
            "Refined story has no acceptance criteria.",
            "missing_acceptance_criteria",
        )

    # Normalize null → [] and require at least one concrete assumption on success.
    assumptions = story.get("assumptions")
    if assumptions is None:
        assumptions = []
        story["assumptions"] = assumptions
    if not isinstance(assumptions, list) or not any(
        isinstance(item, str) and item.strip() for item in assumptions
    ):
        raise StoryAgentError(
            "Refined story is missing assumptions about gaps filled in the input.",
            "missing_assumptions",
        )
    story["assumptions"] = [
        item.strip() for item in assumptions if isinstance(item, str) and item.strip()
    ]

    _finalize_invest_scores(story)
    return story


def story_agent(state: WorkflowState) -> WorkflowState:
    print("Executing Story Agent")

    # Build the client here (not at import time) so a missing key surfaces as a
    # clean agent error instead of crashing the app on startup.
    settings = get_settings()
    if not settings.openai_api_key:
        raise StoryAgentError(
            "OPENAI_API_KEY is not configured.", "openai_not_configured"
        )

    client = OpenAI(api_key=settings.openai_api_key)

    user_prompt = f"""Raw feature description / user story:
{state.get("description", "")}

Draft acceptance criteria (may be empty):
{state.get("acceptance_criteria", "")}"""

    # Use the .parse() method to enforce the Pydantic schema.
    try:
        response = client.chat.completions.parse(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": REFINE_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format=RefinedUserStory,
        )
    except AuthenticationError as exc:
        raise StoryAgentError(
            "OpenAI rejected the configured API key.", "openai_auth_failed"
        ) from exc
    except RateLimitError as exc:
        raise StoryAgentError(
            "OpenAI rate limit reached.", "openai_rate_limit"
        ) from exc
    except NotFoundError as exc:
        raise StoryAgentError(
            f"Model '{settings.openai_model}' is unavailable.",
            "openai_model_unavailable",
        ) from exc
    except (APIConnectionError, APITimeoutError) as exc:
        raise StoryAgentError(
            "Could not reach OpenAI.", "openai_connection_failed"
        ) from exc
    except OpenAIError as exc:
        raise StoryAgentError(
            f"OpenAI request failed: {exc}", "openai_not_ready"
        ) from exc

    # Extract the validated Pydantic object, then re-validate + finalize scores
    # before storing the plain dict on the workflow state.
    parsed = response.choices[0].message.parsed
    state["refined_user_story"] = _validate_output(parsed)

    print("Refined user story generated successfully.")

    return state
