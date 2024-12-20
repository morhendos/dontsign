import { event } from './analytics';

const DEBUG_MODE = process.env.NODE_ENV === 'development';

// Event Categories
export const EventCategory = {
  DOCUMENT: 'document',
  ANALYSIS: 'analysis',
  ERROR: 'error',
  USER: 'user',
  PERFORMANCE: 'performance'
} as const;

// Event Actions
export const EventAction = {
  // File Upload Events
  FILE_UPLOAD_START: 'file_upload_start',
  FILE_UPLOAD_SUCCESS: 'file_upload_success',
  FILE_UPLOAD_ERROR: 'file_upload_error',
  FILE_VALIDATION: 'file_validation',
  
  // Analysis Events
  ANALYSIS_START: 'analysis_start',
  ANALYSIS_COMPLETE: 'analysis_complete',
  ANALYSIS_ERROR: 'analysis_error',
  TEXT_EXTRACTION_START: 'text_extraction_start',
  TEXT_EXTRACTION_COMPLETE: 'text_extraction_complete',
  CHUNK_PROCESSING: 'chunk_processing',
  
  // Generic Events
  ERROR: 'error',
  USER_INTERACTION: 'user_interaction',
  PERFORMANCE_METRIC: 'performance_metric'
} as const;

// Debug utility
const logEvent = (eventName: string, params: any) => {
  if (DEBUG_MODE) {
    console.log(`[Analytics Event] ${eventName}:`, params);
  }
};

// File Upload Events (existing...)

// Analysis Events
export const trackAnalysisStart = (documentType: string, fileSize: number) => {
  const params = {
    action: EventAction.ANALYSIS_START,
    category: EventCategory.ANALYSIS,
    label: documentType,
    value: Math.round(fileSize / 1024) // Size in KB
  };

  logEvent('Analysis Start', params);
  event(params);
};

export const trackAnalysisComplete = (documentType: string, processingTime: number, chunkCount: number) => {
  const params = {
    action: EventAction.ANALYSIS_COMPLETE,
    category: EventCategory.ANALYSIS,
    label: `${documentType}_chunks_${chunkCount}`,
    value: Math.round(processingTime) // Time in ms
  };

  logEvent('Analysis Complete', params);
  event(params);
};

export const trackAnalysisError = (errorType: string, errorDetails: string, documentType: string) => {
  const params = {
    action: EventAction.ANALYSIS_ERROR,
    category: EventCategory.ERROR,
    label: `${errorType}_${documentType}: ${errorDetails}`
  };

  logEvent('Analysis Error', params);
  event(params);
};

export const trackTextExtraction = (stage: 'start' | 'complete', documentType: string, processingTime?: number) => {
  const params = {
    action: stage === 'start' ? EventAction.TEXT_EXTRACTION_START : EventAction.TEXT_EXTRACTION_COMPLETE,
    category: EventCategory.PERFORMANCE,
    label: documentType,
    ...(processingTime && { value: Math.round(processingTime) }) // Time in ms
  };

  logEvent(`Text Extraction ${stage}`, params);
  event(params);
};

export const trackChunkProcessing = (chunkNumber: number, totalChunks: number, processingTime: number) => {
  const params = {
    action: EventAction.CHUNK_PROCESSING,
    category: EventCategory.PERFORMANCE,
    label: `chunk_${chunkNumber}_of_${totalChunks}`,
    value: Math.round(processingTime) // Time in ms
  };

  logEvent('Chunk Processing', params);
  event(params);
};

// Existing error and performance tracking functions...