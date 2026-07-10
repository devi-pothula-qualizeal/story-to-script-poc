import type { PipelineStepConfig } from '@/types/pipeline';

export const DISPLAY_DURATION_SECONDS = 5;

export const PIPELINE_STEPS: PipelineStepConfig[] = [
  { id: 1, label: 'Story Intake' },
  { id: 2, label: 'Refine', sublabel: 'Agent 1' },
  { id: 3, label: 'Test Cases', sublabel: 'Agent 2' },
  { id: 4, label: 'Test Scripts', sublabel: 'Agent 3' },
];
