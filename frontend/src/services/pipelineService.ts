import { apiPost } from '@/services/apiClient';
import type {
  StoryIntake,
  WorkflowNextRequest,
  WorkflowNextResponse,
  WorkflowStartRequest,
  WorkflowStartResponse,
} from '@/types/pipeline';

export async function startWorkflow(input: StoryIntake & { threadId: string }): Promise<WorkflowStartResponse> {
  const payload: WorkflowStartRequest = {
    description: input.description,
    acceptance_criteria: input.acceptanceCriteria,
    thread_id: input.threadId,
  };

  return apiPost<WorkflowStartResponse>('/api/workflow/start', payload);
}

export async function resumeWorkflow(threadId: string): Promise<WorkflowNextResponse> {
  const payload: WorkflowNextRequest = { thread_id: threadId };

  return apiPost<WorkflowNextResponse>('/api/workflow/next', payload);
}