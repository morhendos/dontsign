export type ErrorType =
  | 'API_ERROR'
  | 'INVALID_INPUT'
  | 'TEXT_PROCESSING_ERROR'
  | 'UNKNOWN_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'INVALID_DOCUMENT_TYPE';  // Added this new type

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
      type: 'UNKNOWN_ERROR'
    };
  }

  return {
    message: 'An unexpected error occurred',
    type: 'UNKNOWN_ERROR'
  };
}