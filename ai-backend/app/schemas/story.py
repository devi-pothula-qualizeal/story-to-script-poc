from pydantic import BaseModel, Field
from typing import Optional, List

class Scenario(BaseModel):
    title: str = Field(description="Short title of the scenario")
    given: str = Field(description="Precondition (Given)")
    when: str = Field(description="Action that occurs (When)")
    then: str = Field(description="Expected verifiable outcome (Then)")

class InvestReview(BaseModel):
    independent: str = Field(description="How it can be delivered on its own")
    negotiable: str = Field(description="How it avoids over-specifying the solution")
    valuable: str = Field(description="The exact business or user value delivered")
    estimable: str = Field(description="Whether the scope is clear enough to size")
    small: str = Field(description="Whether it fits in a single sprint; recommend a split if not")
    testable: str = Field(description="Whether the criteria give clear pass/fail conditions")

class RefinedUserStory(BaseModel):
    needs_clarification: bool = Field(description="Set to True ONLY if the input is too vague or nonsensical to derive a business goal.")
    clarification_questions: Optional[List[str]] = Field(description="1-3 targeted questions that would let you write the story. Only populate if needs_clarification is True.", default=None)
    
    title: Optional[str] = Field(description="Short, action-oriented title, max 10 words. Null if clarification is needed.", default=None)
    user_story: Optional[str] = Field(description="Strict format: As a [persona], I want [action], so that [value/benefit]. Null if clarification is needed.", default=None)
    acceptance_criteria: Optional[List[Scenario]] = Field(description="3 to 8 BDD scenarios covering happy path, negative paths, and edge cases.", default=None)
    invest_review: Optional[InvestReview] = Field(description="Critical assessment against INVEST principles.", default=None)
    assumptions: Optional[List[str]] = Field(description="List of every assumption made to fill gaps. Empty list if none.", default=None)
