export type ApiErrorOptions = {
  code?: string;
  details?: unknown;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options.code;
    this.details = options.details;
  }
}

export const apiError = (status: number, message: string, options?: ApiErrorOptions): ApiError =>
  new ApiError(status, message, options);

export const badRequest = (message = "Bad request", options?: ApiErrorOptions): ApiError => apiError(400, message, options);
export const unauthorized = (message = "Unauthorized", options?: ApiErrorOptions): ApiError =>
  apiError(401, message, options);
export const forbidden = (message = "Forbidden", options?: ApiErrorOptions): ApiError => apiError(403, message, options);
export const notFound = (message = "Not found", options?: ApiErrorOptions): ApiError => apiError(404, message, options);
export const conflict = (message = "Conflict", options?: ApiErrorOptions): ApiError => apiError(409, message, options);
export const gone = (message = "Gone", options?: ApiErrorOptions): ApiError => apiError(410, message, options);
export const tooManyRequests = (message = "Too many requests", options?: ApiErrorOptions): ApiError =>
  apiError(429, message, options);
