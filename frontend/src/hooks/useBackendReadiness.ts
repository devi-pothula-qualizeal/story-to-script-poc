import { useCallback, useEffect, useState } from 'react';

import { fetchReadiness } from '@/services/apiClient';
import { formatReadinessError } from '@/utils/formatApiError';

type ReadinessState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'unavailable'; title: string; message: string; errorCode: string | null };

export function useBackendReadiness() {
  const [readiness, setReadiness] = useState<ReadinessState>({ status: 'loading' });

  const checkReadiness = useCallback(async () => {
    setReadiness({ status: 'loading' });
    const result = await fetchReadiness();

    if (result.ready) {
      setReadiness({ status: 'ready' });
      return;
    }

    const formatted = formatReadinessError(result.message, result.errorCode);
    setReadiness({
      status: 'unavailable',
      title: formatted.title,
      message: formatted.message,
      errorCode: formatted.errorCode,
    });
  }, []);

  useEffect(() => {
    void checkReadiness();
  }, [checkReadiness]);

  return {
    readiness,
    isReady: readiness.status === 'ready',
    isChecking: readiness.status === 'loading',
    retryReadiness: checkReadiness,
  };
}
