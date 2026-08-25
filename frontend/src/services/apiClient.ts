import { ApiError, HealthCheckResponse, RequestOptions } from '../types/api';

/**
 * Configurable API Base URL.
 * Defaults to 'http://localhost:8000/api/v1' in development if not provided via Vite env.
 */
const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1';

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

/**
 * Builds full URL with optional query parameters.
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;

  if (!params) {
    return fullUrl;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${fullUrl}?${queryString}` : fullUrl;
}

/**
 * Sanitizes error messages to prevent exposing SQL, stack traces, database URLs,
 * filesystem paths, or internal driver exception details to users.
 */
export function sanitizeErrorMessage(rawMessage?: string | null, status?: number): string {
  if (!rawMessage || typeof rawMessage !== 'string') {
    if (status === 404) return 'The requested resource was not found.';
    if (status === 409) return 'A conflict occurred. The record may already exist or have active dependencies.';
    if (status === 422) return 'Validation failed. Please check the submitted information.';
    if (status && status >= 500) return 'A server error occurred. Please try again later.';
    return 'An unexpected error occurred. Please try again.';
  }

  const lower = rawMessage.toLowerCase();

  // Detect sensitive technical leak patterns
  const containsSensitiveDetails =
    lower.includes('traceback (most recent call last)') ||
    lower.includes('sqlalchemy') ||
    lower.includes('psycopg') ||
    lower.includes('asyncpg') ||
    lower.includes('database_url') ||
    lower.includes('postgres://') ||
    lower.includes('postgresql://') ||
    lower.includes('sqlite3') ||
    lower.includes('syntax error at or near') ||
    lower.includes('relation "') ||
    lower.includes('table "') ||
    lower.includes('/backend/') ||
    lower.includes('/app/') ||
    lower.includes('.py", line') ||
    lower.includes('select ') ||
    lower.includes('insert into ') ||
    lower.includes('update ') ||
    lower.includes('delete from ');

  if (containsSensitiveDetails) {
    if (status === 409) {
      return 'Cannot complete operation due to existing data conflicts or dependencies.';
    }
    if (status === 404) {
      return 'The requested resource was not found.';
    }
    if (status && status >= 500) {
      return 'A server error occurred. Please try again later.';
    }
    return 'An unexpected database error occurred. Please try again.';
  }

  return rawMessage;
}

/**
 * Core request helper that wraps browser fetch API with consistent error extraction.
 */
export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, body, headers, ...customConfig } = options;
  const url = buildUrl(endpoint, params);

  const requestHeaders: HeadersInit = {
    Accept: 'application/json',
    ...(headers || {}),
  };

  let serializedBody: BodyInit | undefined;
  if (body !== undefined) {
    if (typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
      (requestHeaders as Record<string, string>)['Content-Type'] = 'application/json';
      serializedBody = JSON.stringify(body);
    } else {
      serializedBody = body as BodyInit;
    }
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: requestHeaders,
      body: serializedBody,
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return null as unknown as T;
    }

    // Try to parse JSON response body
    let responseData: unknown;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let detail: unknown = undefined;

      if (responseData && typeof responseData === 'object') {
        const errorObj = responseData as { detail?: unknown; message?: string };
        detail = errorObj.detail;
        if (typeof errorObj.detail === 'string') {
          errorMessage = errorObj.detail;
        } else if (Array.isArray(errorObj.detail) && errorObj.detail.length > 0) {
          const firstErr = errorObj.detail[0] as { msg?: string; loc?: string[] };
          errorMessage = firstErr?.msg || JSON.stringify(errorObj.detail);
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        }
      }

      const sanitizedMessage = sanitizeErrorMessage(errorMessage, response.status);

      throw new ApiError(
        response.status,
        sanitizedMessage,
        detail as string | undefined
      );
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or client-side fetch failure
    const rawMessage = error instanceof Error ? error.message : 'Network connection error';
    const cleanMessage =
      rawMessage === 'Failed to fetch' || rawMessage.includes('NetworkError')
        ? 'Unable to connect to backend server. Please check your connection and retry.'
        : sanitizeErrorMessage(rawMessage);

    throw new ApiError(0, cleanMessage);
  }
}

/**
 * Reusable HTTP client methods.
 */
export const apiClient = {
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'POST', body });
  },

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'PUT', body });
  },

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },

  /**
   * Health verification check.
   * Calls GET /health to verify backend connectivity.
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    return apiClient.get<HealthCheckResponse>('/health');
  },
};

export default apiClient;
