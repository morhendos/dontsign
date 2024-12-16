export class PDFProcessingError extends Error {
  constructor(
    message: string,
    public readonly code: PDFErrorCode,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'PDFProcessingError';
  }
}

export type PDFErrorCode = 
  | 'EMPTY_FILE'
  | 'CORRUPT_FILE'
  | 'NO_TEXT_CONTENT'
  | 'EXTRACTION_ERROR'
  | 'INVALID_FORMAT';

export class ContractAnalysisError extends Error {
  constructor(
    message: string,
    public readonly code: ContractAnalysisErrorCode,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ContractAnalysisError';
  }
}

export type ContractAnalysisErrorCode = 
  | 'PDF_PROCESSING_ERROR'
  | 'TEXT_PROCESSING_ERROR'
  | 'API_ERROR'
  | 'INVALID_INPUT';