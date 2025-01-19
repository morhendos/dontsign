export type ErrorType =
  | 'API_ERROR'
  | 'INVALID_INPUT'
  | 'INVALID_DOCUMENT_TYPE'
  | 'RATE_LIMIT'
  | 'UNKNOWN';

export class ContractAnalysisError extends Error {
  type: ErrorType;

  constructor(message: string, type: ErrorType) {
    super(message);
    this.type = type;
    this.name = 'ContractAnalysisError';
  }
}

export function getErrorMessage(error: unknown): { message: string; type: ErrorType } {
  if (error instanceof ContractAnalysisError) {
    return {
      message: error.message,
      type: error.type
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      type: 'UNKNOWN'
    };
  }

  return {
    message: 'An unexpected error occurred',
    type: 'UNKNOWN'
  };
}