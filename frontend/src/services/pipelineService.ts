import { apiPost } from '@/services/apiClient';
import type { RefineStoryRequest, RefineStoryResponse, StoryIntake } from '@/types/pipeline';

export async function refineStory(input: StoryIntake): Promise<string> {
  const payload: RefineStoryRequest = { user_story: input.userStory };
  const data = await apiPost<RefineStoryResponse>('/api/refine', payload);
  return data.refined_story;
}
