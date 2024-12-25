/**
 * Base error class for the application
 */
export class BaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public clientMessage?: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when the circuit breaker is open
 */
export class CircuitBreakerError extends BaseError {
  constructor(message: string, retryAfterMs: number) {
    super(
      message,
      'CIRCUIT_BREAKER_OPEN',
      `AI service is temporarily unavailable. Please try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`
    );
  }
}

/**
 * Error thrown when OpenAI rate limits are hit
 */
export class RateLimitError extends BaseError {
  constructor(message: string) {
    super(
      message,
      'RATE_LIMIT_EXCEEDED',
      'Our AI service is experiencing high demand. Please try again in a few moments.'
    );
  }
}

/**
 * Error thrown when OpenAI has internal server errors
 */
export class AIServiceError extends BaseError {
  constructor(message: string) {
    super(
      message,
      'AI_SERVICE_ERROR',
      'Our AI service is temporarily unavailable. We\'re working on it.'
    );
  }
}

/**
 * Error thrown when the analysis takes too long
 */
export class AnalysisTimeoutError extends BaseError {
  constructor() {
    super(
      'Analysis timed out',
      'ANALYSIS_TIMEOUT',
      'The analysis is taking longer than expected. Please try with a shorter document or try again later.'
    );
  }
}
