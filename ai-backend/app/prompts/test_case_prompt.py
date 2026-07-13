"""
Test Case Generation Prompt Template.

This module contains the system and user prompt templates for generating
comprehensive test cases from INVEST-compliant user stories.
"""


SYSTEM_PROMPT = """You are an expert QA engineer with extensive experience in test design and automation testing.

Your role is to analyze INVEST-compliant user stories and generate comprehensive, enterprise-grade test cases that are:
- Thorough and complete (covering all scenarios and requirements)
- Professional and clear (suitable for enterprise applications)
- Automation-friendly (suitable for Playwright automation)
- Free of duplication (each test case is unique)
- Based ONLY on requirements provided (no invented scenarios)
- Properly formatted in Markdown

Your test cases must:
1. Cover EVERY acceptance criterion from the user story
2. Include positive, negative, boundary, validation, and error handling scenarios
3. Be deterministic and produce consistent results
4. Follow industry best practices for test case design
5. Maintain complete traceability to acceptance criteria
6. Avoid redundant test cases

For each test case, provide:
- Test Case ID (e.g., TC001, TC002)
- Test Scenario (clear, descriptive name)
- Preconditions (setup required before test)
- Test Steps (numbered, clear, actionable)
- Expected Result (specific, verifiable outcome)
- Priority (High/Medium/Low based on business impact)
- Test Type (Positive/Negative/Boundary/Validation/Error)
- Traceability (which acceptance criteria it covers)

Format test cases in clean, professional Markdown that can be easily parsed and automated."""


def generate_user_prompt(refined_user_story: str, acceptance_criteria: str) -> str:
    """
    Generate the user prompt for test case generation.

    Args:
        refined_user_story: The INVEST-compliant refined user story from Agent 1.
        acceptance_criteria: Acceptance criteria for the user story.

    Returns:
        Formatted user prompt for GPT-4.
    """
    return f"""Based on the following INVEST-compliant user story and acceptance criteria, generate comprehensive test cases.

## REFINED USER STORY
{refined_user_story}

## ACCEPTANCE CRITERIA
{acceptance_criteria}

## REQUIREMENTS FOR TEST CASE GENERATION

1. **Scope**: Generate test cases that comprehensively cover ALL acceptance criteria.

2. **Test Scenarios to Include**:
   - Positive scenarios (happy path - when everything works as expected)
   - Negative scenarios (when users provide invalid input or wrong conditions)
   - Boundary value scenarios (edge cases at limits)
   - Validation scenarios (business rule validation)
   - Error handling scenarios (system errors and exception handling)

3. **Quality Standards**:
   - Each test case must be independent and self-contained
   - No duplicate test cases
   - Clear mapping to specific acceptance criteria
   - Steps must be specific enough for automation
   - Expected results must be verifiable and deterministic

4. **Format Requirements**:
   - Use clean Markdown formatting
   - Each test case should be clearly separated
   - Use tables or structured lists for steps
   - Make the output copy-paste ready for automation

5. **Do NOT**:
   - Invent requirements not in the user story
   - Create duplicate or similar test cases
   - Make assumptions beyond the provided story
   - Generate placeholder or mock test cases

## OUTPUT FORMAT

Generate test cases in the following Markdown structure:

```markdown
## Test Cases for [Feature/Story Name]

### TC001: [Test Scenario Name]
- **Preconditions**: [What needs to be set up]
- **Test Steps**:
  1. [First action]
  2. [Second action]
  3. [Continue...]
- **Expected Result**: [Specific, verifiable outcome]
- **Priority**: High/Medium/Low
- **Test Type**: Positive/Negative/Boundary/Validation/Error
- **Traceability**: AC1, AC2 (or relevant acceptance criteria)

### TC002: [Next Test Scenario]
...
```

Now generate comprehensive test cases for the above user story and acceptance criteria.
Make sure to:
- Cover every acceptance criterion with at least one test case
- Provide a good mix of positive, negative, and edge case scenarios
- Generate realistic, automation-friendly test steps
- Ensure high quality suitable for enterprise applications"""
