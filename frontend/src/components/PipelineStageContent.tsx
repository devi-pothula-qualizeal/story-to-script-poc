import { RefinedStoryResult } from '@/components/RefinedStoryResult';
import { TestCaseResult } from '@/components/TestCaseResult';
import type { PipelineStep, RefinedUserStory } from '@/types/pipeline';
import { formatClarificationQuestions, formatSuccessStory } from '@/utils/formatRefinedStory';

interface PipelineStageContentProps {
  currentStep: PipelineStep;
  refinedStory: RefinedUserStory | null;
  testCases: string | null;
  playwrightScript: string | null;
  timeLeft: number;
}

export function PipelineStageContent({
  currentStep,
  refinedStory,
  testCases,
  playwrightScript,
  timeLeft,
}: PipelineStageContentProps) {
  if (currentStep === 2 && refinedStory) {
    if (refinedStory.needs_clarification) {
      return (
        <RefinedStoryResult
          content={formatClarificationQuestions(refinedStory.clarification_questions)}
          timeLeft={timeLeft}
        />
      );
    }
    return (
      <RefinedStoryResult
        content={formatSuccessStory(refinedStory)}
        timeLeft={timeLeft}
      />
    );
  }

  if (currentStep === 3 && testCases) {
    return <TestCaseResult content={testCases} timeLeft={timeLeft} />;
  }

  if (currentStep === 4 && playwrightScript) {
    return (
      <section className="rounded-xl border border-surface-border bg-surface-card p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Playwright test script</h2>
          <p className="mt-1 text-sm text-muted">Agent 3 completed the workflow.</p>
        </div>

        <pre className="max-h-96 overflow-auto rounded-lg border border-surface-border bg-surface-input p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {playwrightScript}
        </pre>
      </section>
    );
  }

  return null;
}
