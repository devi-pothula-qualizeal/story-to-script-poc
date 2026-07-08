export type PipelineStep = 1 | 2 | 3 | 4;

export interface StoryIntake {
  userStory: string;
}

export interface RefineStoryRequest {
  user_story: string;
}

export interface RefineStoryResponse {
  refined_story: string;
}

export interface PipelineStepConfig {
  id: PipelineStep;
  label: string;
  sublabel?: string;
}
