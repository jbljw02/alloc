export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  /** Supabase error code: The request expected a single row, but 0 rows were returned. */
  SINGLE_ROW_EXPECTED: 'PGRST116'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly originalError?: unknown;

  constructor(message: string, code: ErrorCode = ERROR_CODES.UNKNOWN_ERROR, originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
