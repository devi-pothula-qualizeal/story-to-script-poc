import { RefinedStoryResult } from '@/components/RefinedStoryResult';
import { TestCaseResult } from '@/components/TestCaseResult';
import type { PipelineStep, RefinedUserStory, TestCase } from '@/types/pipeline';
import { formatClarificationQuestions, formatSuccessStory } from '@/utils/formatRefinedStory';
import { formatTestCases } from '@/utils/formatTestCases';
import { PlaywrightScriptResult } from './PlaywrightScriptResult';

interface PipelineStageContentProps {
  currentStep: PipelineStep;
  refinedStory: RefinedUserStory | null;
  testCases: TestCase[] | null;
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

  if (currentStep === 3 && testCases?.length) {
    return <TestCaseResult content={formatTestCases(testCases)} timeLeft={timeLeft} />;
  }

  if (currentStep === 4 && playwrightScript) {
    return (
      <PlaywrightScriptResult
        content={playwrightScript}
        timeLeft={timeLeft}
      />
    );
  }

  return null;
}
