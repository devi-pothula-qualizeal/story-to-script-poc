import { useState, useEffect, useCallback } from 'react';

export function useCountdown(initialSeconds: number, onComplete: () => void) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Stop the timer when it hits 0 and trigger the callback
    if (isActive && timeLeft === 0) {
      setIsActive(false);
      onComplete();
      return;
    }

    // Do nothing if the timer isn't active
    if (!isActive) return;

    // Run the countdown
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isActive, timeLeft, onComplete]);

  const startTimer = useCallback(() => {
    setTimeLeft(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(0);
  }, []);

  return { timeLeft, startTimer, stopTimer };
}