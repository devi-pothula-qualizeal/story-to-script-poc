from typing import List

from pydantic import BaseModel, Field


class TestCase(BaseModel):
    id: str = Field(description="Test case ID, e.g. TC001, TC002")
    scenario: str = Field(description="Clear, descriptive name of the test scenario")
    preconditions: str = Field(description="Setup required before the test")
    steps: List[str] = Field(description="Numbered, clear, actionable test steps")
    expected_result: str = Field(description="Specific, verifiable outcome")
    priority: str = Field(description="High, Medium, or Low based on business impact")
    test_type: str = Field(
        description="Positive, Negative, Boundary, Validation, or Error"
    )
    traceability: str = Field(
        description="Which acceptance criteria this covers, e.g. AC1, AC2"
    )


class TestCaseOutput(BaseModel):
    test_cases: List[TestCase] = Field(
        description="Comprehensive list of test cases covering all acceptance criteria"
    )
