export type ErrorCode =
  | 'EMPTY_FILE'
  | 'CORRUPT_FILE'
  | 'NO_TEXT_CONTENT'
  | 'EXTRACTION_ERROR'
  | 'INVALID_FORMAT'
  | 'FILE_TOO_LARGE'
  | 'API_ERROR'
  | 'INVALID_INPUT'
  | 'TEXT_PROCESSING_ERROR'
  | 'UNKNOWN_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'INVALID_DOCUMENT_TYPE'
  | 'RATE_LIMIT';

// Export ErrorCode as ErrorType for backward compatibility
export type ErrorType = ErrorCode;

export class BaseError extends Error {
  constructor(message: string, public code: ErrorCode, public cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class PDFProcessingError extends BaseError {
  constructor(
    message: string,
    code: Extract<ErrorCode, 'EMPTY_FILE' | 'CORRUPT_FILE' | 'NO_TEXT_CONTENT' | 'EXTRACTION_ERROR' | 'INVALID_FORMAT' | 'FILE_TOO_LARGE'>,
    cause?: unknown
  ) {
    super(message, code, cause);
  }
}

export class ContractAnalysisError extends BaseError {
  constructor(
    message: string,
    code: Extract<ErrorCode, 
      | 'API_ERROR' 
      | 'INVALID_INPUT' 
      | 'TEXT_PROCESSING_ERROR' 
      | 'UNKNOWN_ERROR' 
      | 'CONFIGURATION_ERROR'
      | 'INVALID_DOCUMENT_TYPE'
      | 'RATE_LIMIT'>,
    cause?: unknown
  ) {
    super(message, code, cause);
  }
}
