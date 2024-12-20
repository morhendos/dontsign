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
  FILE_UPLOAD_START: 'file_upload_start',
  FILE_UPLOAD_SUCCESS: 'file_upload_success',
  FILE_UPLOAD_ERROR: 'file_upload_error',
  FILE_VALIDATION: 'file_validation',
  ANALYSIS_START: 'analysis_start',
  ANALYSIS_COMPLETE: 'analysis_complete',
  ERROR: 'error',
  USER_INTERACTION: 'user_interaction',
  PERFORMANCE_METRIC: 'performance_metric'
} as const;

// Event Names for User Interactions
export const EventName = {
  DRAG_DROP: 'drag_drop',
  CLICK_UPLOAD: 'click_upload',
  BUTTON_CLICK: 'button_click'
} as const;

// Debug utility
const logEvent = (eventName: string, params: any) => {
  if (DEBUG_MODE) {
    console.log(`[Analytics Event] ${eventName}:`, params);
  }
};

// File upload tracking
export const trackFileUploadStart = (method: 'drag_drop' | 'click') => {
  const params = {
    action: EventAction.FILE_UPLOAD_START,
    category: EventCategory.DOCUMENT,
    label: `upload_method_${method}`
  };
  
  logEvent('File Upload Start', params);
  event(params);
};

export const trackFileUploadSuccess = (fileType: string, fileSize: number) => {
  const params = { 
    action: EventAction.FILE_UPLOAD_SUCCESS, 
    category: EventCategory.DOCUMENT, 
    label: fileType,
    value: Math.round(fileSize / 1024) // Convert to KB
  };
  
  logEvent('File Upload Success', params);
  event(params);
};

export const trackFileValidationError = (errorType: string, fileType?: string) => {
  const params = {
    action: EventAction.FILE_UPLOAD_ERROR,
    category: EventCategory.ERROR,
    label: `validation_${errorType}${fileType ? `_${fileType}` : ''}`
  };

  logEvent('File Validation Error', params);
  event(params);
};

// Analysis tracking (existing functions...)
export const trackAnalysisStart = (documentType: string) => {
  const params = {
    action: EventAction.ANALYSIS_START,
    category: EventCategory.ANALYSIS,
    label: documentType
  };

  logEvent('Analysis Start', params);
  event(params);
};

export const trackAnalysisComplete = (documentType: string, processingTime: number) => {
  const params = {
    action: EventAction.ANALYSIS_COMPLETE,
    category: EventCategory.ANALYSIS,
    label: documentType,
    value: Math.round(processingTime * 1000) // Convert to milliseconds
  };

  logEvent('Analysis Complete', params);
  event(params);
};

// Error tracking
export const trackError = (errorType: string, errorMessage: string) => {
  const params = {
    action: EventAction.ERROR,
    category: EventCategory.ERROR,
    label: `${errorType}: ${errorMessage}`
  };

  logEvent('Error', params);
  event(params);
};

// User interaction tracking
export const trackUserInteraction = (interactionType: string, details?: string) => {
  const params = {
    action: EventAction.USER_INTERACTION,
    category: EventCategory.USER,
    label: details ? `${interactionType}: ${details}` : interactionType
  };

  logEvent('User Interaction', params);
  event(params);
};

// Performance tracking
export const trackPerformanceMetric = (metricName: string, value: number) => {
  const params = {
    action: EventAction.PERFORMANCE_METRIC,
    category: EventCategory.PERFORMANCE,
    label: metricName,
    value: Math.round(value)
  };

  logEvent('Performance Metric', params);
  event(params);
};