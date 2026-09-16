/**
 * Resilient API Client for NovaBiz
 */

export class ApiError extends Error {
  status: number;
  data: unknown;
  code?: string;

  constructor(message: string, status: number, data?: unknown, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

interface RequestOptions extends RequestInit {
  idempotencyKey?: string;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { idempotencyKey, headers = {}, ...customConfig } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (idempotencyKey) {
    defaultHeaders['Idempotency-Key'] = idempotencyKey;
  }

  const config: RequestInit = {
    method: customConfig.body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  let response: Response;
  try {
    response = await fetch(endpoint, config);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network connection failure. Please check your internet connection.';
    throw new ApiError(message, 0);
  }

  // Parse JSON response if present
  let data: unknown;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg =
      (typeof data === 'object' && data !== null && 'message' in data && typeof (data as { message: unknown }).message === 'string')
        ? (data as { message: string }).message
        : response.statusText || 'An unexpected error occurred';
    
    const errorCode = (typeof data === 'object' && data !== null && 'code' in data && typeof (data as { code: unknown }).code === 'string')
      ? (data as { code: string }).code
      : undefined;

    throw new ApiError(errorMsg, response.status, data, errorCode);
  }

  return data as T;
}
