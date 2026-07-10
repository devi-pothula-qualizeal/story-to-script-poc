import { useCallback, useEffect, useRef, useState } from 'react';

import { v4 as uuidv4 } from 'uuid';


import { DISPLAY_DURATION_SECONDS } from '@/constants/pipeline';
import { useCountdown } from '@/hooks/useCountdown';
import { resumeWorkflow, startWorkflow } from '@/services/pipelineService';
import type { PipelineStep } from '@/types/pipeline';
import { formatApiError, type FormattedError } from '@/utils/formatApiError';

export function usePipeline() {
    const [threadId, setThreadId] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<PipelineStep>(1);
  const [description, setDescription] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [refinedStory, setRefinedStory] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<string | null>(null);
  const [playwrightScript, setPlaywrightScript] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FormattedError | null>(null);
  const currentStepRef = useRef<PipelineStep>(currentStep);
  const threadIdRef = useRef<string | null>(threadId);

  currentStepRef.current = currentStep;
  threadIdRef.current = threadId;

  const handleTimerComplete = useCallback(async () => {
    const step = currentStepRef.current;
    const activeThreadId = threadIdRef.current;

    if (!activeThreadId) {
      setError({
        title: 'Workflow interrupted',
        message: 'The workflow thread was not found. Please start again.',
        errorCode: null,
      });
      setCurrentStep(1);
      return;
    }

    if (step === 2) {
      setIsLoading(true);
      setError(null);

      try {
        const response = await resumeWorkflow(activeThreadId);
        setTestCases(response.test_cases ?? null);
        setCurrentStep(3);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setIsLoading(false);
      }

      return;
    }

    if (step === 3) {
      setIsLoading(true);
      setError(null);

      try {
        const response = await resumeWorkflow(activeThreadId);
        setPlaywrightScript(response.playwright_script ?? null);
        setCurrentStep(4);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const { timeLeft, startTimer } = useCountdown(
    DISPLAY_DURATION_SECONDS,
    handleTimerComplete,
  );

  useEffect(() => {
    if (currentStep === 2 || currentStep === 3) {
      startTimer();
    }
  }, [currentStep, startTimer]);

  const submitStory = useCallback(async () => {
    if (!description.trim() || !acceptanceCriteria.trim()) {
      setError({
        title: 'Missing details',
        message: 'Please provide both a description and acceptance criteria.',
        errorCode: null,
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setRefinedStory(null);
    setTestCases(null);
    setPlaywrightScript(null);

    try {
      const generatedThreadId = uuidv4();
      setThreadId(generatedThreadId);

      const response = await startWorkflow({ description, acceptanceCriteria, threadId: generatedThreadId });
      setRefinedStory(response.result.refined_user_story ?? null);
      setCurrentStep(2);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [acceptanceCriteria, description, startTimer]);

  const dismissError = useCallback(() => setError(null), []);

  return {
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
  };
}
