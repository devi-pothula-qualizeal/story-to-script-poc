import { ConfigurationBanner } from '@/components/ConfigurationBanner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { PipelineStageContent } from '@/components/PipelineStageContent';
import { PipelineStepper } from '@/components/PipelineStepper';
import { StoryIntakeForm } from '@/components/StoryIntakeForm';
import { useBackendReadiness } from '@/hooks/useBackendReadiness';
import { usePipeline } from '@/hooks/usePipeline';
import type { PipelineStep } from '@/types/pipeline';

function App() {
  const {
    currentStep,
    description,
    acceptanceCriteria,
    refinedStory,
    testCases,
    playwrightScript,
    isLoading,
    error,
    timeLeft,
    setDescription,
    setAcceptanceCriteria,
    submitStory,
    dismissError,
  } = usePipeline();

  const { readiness, isReady, isChecking, retryReadiness } = useBackendReadiness();
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
              description={description}
              acceptanceCriteria={acceptanceCriteria}
              isLoading={isLoading}
              disabled={pipelineDisabled}
              onDescriptionChange={setDescription}
              onAcceptanceCriteriaChange={setAcceptanceCriteria}
              onSubmit={submitStory}
            />
          ) : null}

          <PipelineStageContent
            currentStep={currentStep}
            refinedStory={refinedStory}
            testCases={testCases}
            playwrightScript={playwrightScript}
            timeLeft={timeLeft}
          />

          {isLoading ? <LoadingOverlay message={getLoadingMessage(currentStep)} /> : null}
        </div>
      </div>
    </div>
  );
}

function getLoadingMessage(step: PipelineStep) {
  if (step === 1) return 'Refining user story with Agent 1...';
  if (step === 2) return 'Resuming workflow for Agent 2...';
  if (step === 3) return 'Resuming workflow for Agent 3...';
  return 'Processing...';
}

export default App;
