export class ApiError extends Error {
  readonly status: number;
  readonly errorCode: string | null;

  constructor(message: string, status: number, errorCode: string | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

type FastApiErrorBody = {
  detail?: string | Array<{ msg?: string; message?: string }>;
  error_code?: string;
};

function parseErrorDetail(body: FastApiErrorBody): string | null {
  if (typeof body.detail === 'string') {
    return body.detail;
  }

  if (Array.isArray(body.detail) && body.detail.length > 0) {
    return body.detail
      .map((item) => item.msg ?? item.message)
      .filter(Boolean)
      .join(', ');
  }

  return null;
}

function parseErrorResponse(status: number, body: FastApiErrorBody): ApiError {
  const detail = parseErrorDetail(body);
  const message = detail ?? `Request failed with status ${status}`;
  return new ApiError(message, status, body.error_code ?? null);
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    try {
      const errorBody = (await response.json()) as FastApiErrorBody;
      throw parseErrorResponse(response.status, errorBody);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Request failed with status ${response.status}`, response.status);
    }
  }

  return response.json() as Promise<TResponse>;
}

export async function apiPost<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    try {
      const errorBody = (await response.json()) as FastApiErrorBody;
      throw parseErrorResponse(response.status, errorBody);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Request failed with status ${response.status}`, response.status);
    }
  }

  return response.json() as Promise<TResponse>;
}

export type ReadinessResult = {
  ready: boolean;
  message: string;
  errorCode: string | null;
};

export async function fetchReadiness(): Promise<ReadinessResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/readiness`);

    try {
      const body = (await response.json()) as {
        ready?: boolean;
        message?: string;
        detail?: string;
        error_code?: string;
      };

      if (typeof body.ready === 'boolean' && body.message) {
        return {
          ready: body.ready,
          message: body.message,
          errorCode: body.error_code ?? null,
        };
      }

      if (body.detail) {
        return {
          ready: false,
          message: body.detail,
          errorCode: body.error_code ?? null,
        };
      }
    } catch {
      // Response body is not JSON.
    }

    if (!response.ok) {
      return {
        ready: false,
        message: `Backend readiness check failed with status ${response.status}.`,
        errorCode: null,
      };
    }

    return {
      ready: false,
      message: 'Backend readiness check returned an unexpected response.',
      errorCode: null,
    };
  } catch {
    return {
      ready: false,
      message: 'Unable to reach the backend. Start ai-backend and try again.',
      errorCode: 'backend_unreachable',
    };
  }
}
