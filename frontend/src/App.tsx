import { ConfigurationBanner } from '@/components/ConfigurationBanner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { PipelineStepper } from '@/components/PipelineStepper';
import { RefinedStoryResult } from '@/components/RefinedStoryResult';
import { StoryIntakeForm } from '@/components/StoryIntakeForm';
import { TestCaseForm } from '@/components/TestCaseForm';
import { TestCaseResult } from '@/components/TestCaseResult';
import { useBackendReadiness } from '@/hooks/useBackendReadiness';
import { usePipeline } from '@/hooks/usePipeline';
import type { PipelineStep } from '@/types/pipeline';

function App() {
  const { readiness, isReady, isChecking, retryReadiness } = useBackendReadiness();
  const {
    currentStep,
    userStory,
    refinedStory,
    testCases,
    isLoading,
    error,
    timeLeft,
    showStep3Result,
    setUserStory,
    submitStory,
    submitTestCases,
    dismissError,
  } = usePipeline();

  const pipelineDisabled = !isReady;

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Agent Pipeline · Proof of Concept
          </p>
          <h1 className="mt-2 text-3xl font-bold">User Story → Test Scripts</h1>
        </header>

        <PipelineStepper currentStep={currentStep} />

        {readiness.status === 'unavailable' ? (
          <ConfigurationBanner
            title={readiness.title}
            message={readiness.message}
            isChecking={isChecking}
            onRetry={retryReadiness}
          />
        ) : null}

        {error ? (
          <ErrorAlert title={error.title} message={error.message} onDismiss={dismissError} />
        ) : null}

        <div className="relative">
          {currentStep === 1 ? (
            <StoryIntakeForm
              userStory={userStory}
              isLoading={isLoading}
              disabled={pipelineDisabled}
              onUserStoryChange={setUserStory}
              onSubmit={submitStory}
            />
          ) : null}

          {currentStep === 2 && refinedStory ? (
            <RefinedStoryResult content={refinedStory} timeLeft={timeLeft} />
          ) : null}

          {currentStep === 3 && refinedStory && !showStep3Result ? (
            <TestCaseForm
              refinedStory={refinedStory}
              isLoading={isLoading}
              disabled={pipelineDisabled}
              onSubmit={submitTestCases}
            />
          ) : null}

          {currentStep === 3 && testCases && showStep3Result ? (
            <TestCaseResult content={testCases} timeLeft={timeLeft} />
          ) : null}

          {currentStep === 4 ? (
            <section className="rounded-xl border border-surface-border bg-surface-card p-6">
              <h2 className="text-xl font-semibold">Test script generation</h2>
              <p className="mt-2 text-sm text-muted">
                Step 4 is reserved for Agent 3. Test cases are ready to move into script generation.
              </p>
            </section>
          ) : null}

          {isLoading ? <LoadingOverlay message={getLoadingMessage(currentStep)} /> : null}
        </div>
      </div>
    </div>
  );
}

function getLoadingMessage(step: PipelineStep) {
  if (step === 1) return 'Refining user story with Agent 1...';
  if (step === 3) return 'Generating test cases with Agent 2...';
  return 'Processing...';
}

export default App;
