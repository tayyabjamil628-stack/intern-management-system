export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  detail?: string | ApiErrorDetail[] | Record<string, unknown>;

  constructor(status: number, message: string, detail?: string | ApiErrorDetail[] | Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;

    // Restore prototype chain for instanceof checks in ES5/ES6
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface HealthCheckResponse {
  status: string;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
}
