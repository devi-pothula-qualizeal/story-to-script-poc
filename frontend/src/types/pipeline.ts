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
    test_cases?: string;
    playwright_script?: string;
  };
}

export interface WorkflowNextRequest {
  thread_id: string;
}

export interface WorkflowNextResponse {
  refined_user_story?: string;
  test_cases?: string;
  playwright_script?: string;
}

export interface PipelineStepConfig {
  id: PipelineStep;
  label: string;
  sublabel?: string;
}
