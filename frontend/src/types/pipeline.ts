export type PipelineStep = 1 | 2 | 3 | 4;

export interface StoryIntake {
  description: string;
  acceptanceCriteria: string;
}

export interface WorkflowStartRequest {
  description: string;
  acceptance_criteria: string;
  thread_id: string;
}

export interface WorkflowStartResponse {
  thread_id: string;
  result: {
    refined_user_story: string;
    test_cases?: TestCase[];
    playwright_script?: string;
  };
}

export interface WorkflowNextRequest {
  thread_id: string;
}

export interface WorkflowNextResponse {
  refined_user_story?: string;
  test_cases?: TestCase[];
  playwright_script?: string;
}

export interface PipelineStepConfig {
  id: PipelineStep;
  label: string;
  sublabel?: string;
}

export interface RefinedUserStory {
  needs_clarification: boolean;
  clarification_questions?: string[] | null;
  title?: string | null;
  user_story?: string | null;
  acceptance_criteria?: Scenario[] | null;
  assumptions?: string[] | null;
  invest_review?: InvestReview | null;
}


export interface Scenario {
  title: string;
  given: string;
  when: string;
  then: string;
}

export interface InvestCriterion {
  score: number;
  assessment: string;
}

export interface InvestReview {
  independent: InvestCriterion;
  negotiable: InvestCriterion;
  valuable: InvestCriterion;
  estimable: InvestCriterion;
  small: InvestCriterion;
  testable: InvestCriterion;
  /** Mean of the six principle scores, computed on the backend. */
  overall_score?: number;
}

export interface TestCase {
  id: string;
  scenario: string;
  preconditions: string;
  steps: string[];
  expected_result: string;
  priority: string;
  test_type: string;
  traceability: string;
}