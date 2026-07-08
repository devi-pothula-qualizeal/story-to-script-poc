import { useCallback, useRef, useState } from 'react';

import { DISPLAY_DURATION_SECONDS } from '@/constants/pipeline';
import { useCountdown } from '@/hooks/useCountdown';
import { refineStory } from '@/services/pipelineService';
import type { PipelineStep } from '@/types/pipeline';
import { formatApiError, type FormattedError } from '@/utils/formatApiError';

export function usePipeline() {
  const [currentStep, setCurrentStep] = useState<PipelineStep>(1);
  const [userStory, setUserStory] = useState('');
  const [refinedStory, setRefinedStory] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FormattedError | null>(null);
  const [showStep3Result, setShowStep3Result] = useState(false);
  const currentStepRef = useRef<PipelineStep>(currentStep);
  currentStepRef.current = currentStep;

  const handleTimerComplete = useCallback(() => {
    const step = currentStepRef.current;

    if (step === 2) {
      setCurrentStep(3);
      return;
    }

    if (step === 3) {
      setShowStep3Result(false);
      setTestCases(null);
      setCurrentStep(4);
    }
  }, []);

  const { timeLeft, startTimer } = useCountdown(
    DISPLAY_DURATION_SECONDS,
    handleTimerComplete,
  );

  const submitStory = useCallback(async () => {
    if (!userStory.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await refineStory({ userStory });
      setRefinedStory(result);
      setCurrentStep(2);
      startTimer();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [startTimer, userStory]);

  const submitTestCases = useCallback(async () => {
    if (!refinedStory) return;

    setError({
      title: 'Not available yet',
      message: 'Test case generation is not implemented. Only user story refinement is enabled for now.',
      errorCode: null,
    });
  }, [refinedStory]);

  const dismissError = useCallback(() => setError(null), []);

  return {
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
  };
}
