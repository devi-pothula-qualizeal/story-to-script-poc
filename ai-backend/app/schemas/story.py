from pydantic import BaseModel, Field
from typing import Optional, List

class Scenario(BaseModel):
    title: str = Field(description="Short title of the scenario")
    given: str = Field(description="Precondition (Given)")
    when: str = Field(description="Action that occurs (When)")
    then: str = Field(description="Expected verifiable outcome (Then)")


class InvestCriterion(BaseModel):
    assessment: str = Field(
        description="One or two sentences justifying the score, citing a concrete "
        "strength or gap in THIS story. Write this before choosing the score."
    )
    score: int = Field(
        description="Quality score from 0 to 100 for this single principle, chosen "
        "from the anchored bands in the system prompt (Excellent 85-100, Good 65-84, "
        "Partial 45-64, Weak 25-44, Absent 0-24). Do not inflate."
    )


class InvestReview(BaseModel):
    independent: InvestCriterion = Field(description="Can it be delivered on its own, with no hidden dependency on another story?")
    negotiable: InvestCriterion = Field(description="Does it capture the what/why and leave the how open, with no baked-in solution?")
    valuable: InvestCriterion = Field(description="Does it deliver explicit value to a specific, named persona?")
    estimable: InvestCriterion = Field(description="Is the scope concrete enough for the team to size it?")
    small: InvestCriterion = Field(description="Does it realistically fit within a single sprint?")
    testable: InvestCriterion = Field(description="Do the acceptance criteria give unambiguous pass/fail conditions?")


class RefinedUserStory(BaseModel):
    needs_clarification: bool = Field(description="Set to True ONLY if the input is too vague or nonsensical to derive a business goal.")
    clarification_questions: Optional[List[str]] = Field(description="1-3 targeted questions that would let you write the story. Only populate if needs_clarification is True.", default=None)

    title: Optional[str] = Field(description="Short, action-oriented title, max 10 words. Null if clarification is needed.", default=None)
    user_story: Optional[str] = Field(description="Strict format: As a [persona], I want [action], so that [value/benefit]. Null if clarification is needed.", default=None)
    acceptance_criteria: Optional[List[Scenario]] = Field(description="3 to 8 BDD scenarios covering happy path, negative paths, and edge cases.", default=None)
    # Placed before invest_review so structured output fills it before the large nested object.
    assumptions: List[str] = Field(
        description=(
            "Every gap you filled while refining this story — persona details, scope "
            "boundaries, auth/state, data rules, out-of-scope exclusions, or edge "
            "behavior inferred from incomplete input. Prefer 2–5 concrete items. "
            "Do not silently invent requirements; list them here instead. "
            "Use an empty list ONLY when needs_clarification is True."
        ),
        default_factory=list,
    )
    invest_review: Optional[InvestReview] = Field(description="Critical assessment against INVEST principles.", default=None)
