import { ApiError } from '@/services/apiClient';

export type FormattedError = {
  title: string;
  message: string;
  errorCode: string | null;
};

const ERROR_TITLES: Record<string, string> = {
  openai_not_configured: 'OpenAI API key missing',
  openai_auth_failed: 'OpenAI API key rejected',
  openai_not_ready: 'OpenAI not ready',
  openai_rate_limit: 'OpenAI rate limit reached',
  openai_connection_failed: 'Cannot reach OpenAI',
  openai_model_unavailable: 'OpenAI model unavailable',
  backend_unreachable: 'Backend unavailable',
  configuration_error: 'Configuration error',
};

export function formatApiError(error: unknown): FormattedError {
  if (error instanceof ApiError) {
    const errorCode = error.errorCode;
    const title = (errorCode && ERROR_TITLES[errorCode]) || 'Something went wrong';

    return {
      title,
      message: error.message,
      errorCode,
    };
  }

  if (error instanceof Error) {
    return {
      title: 'Something went wrong',
      message: error.message,
      errorCode: null,
    };
  }

  return {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
    errorCode: null,
  };
}

export function formatReadinessError(message: string, errorCode: string | null): FormattedError {
  const title = (errorCode && ERROR_TITLES[errorCode]) || 'Pipeline unavailable';

  return {
    title,
    message,
    errorCode,
  };
}
