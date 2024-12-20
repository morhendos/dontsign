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
  FILE_UPLOAD: 'file_upload',
  ANALYSIS_START: 'analysis_start',
  ANALYSIS_COMPLETE: 'analysis_complete',
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

// File upload tracking
export const trackFileUpload = (fileType: string, fileSize: number) => {
  const params = { 
    action: EventAction.FILE_UPLOAD, 
    category: EventCategory.DOCUMENT, 
    label: fileType,
    value: Math.round(fileSize / 1024) // Convert to KB
  };
  
  logEvent('File Upload', params);
  event(params);
};

// Analysis tracking
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
