import { event } from './analytics';

const DEBUG_ANALYTICS = process.env.NODE_ENV === 'development';

export const trackFileUpload = (fileType: string, fileSize: number) => {
  if (DEBUG_ANALYTICS) {
    console.log('Analytics Event:', { 
      action: 'file_upload', 
      category: 'document', 
      label: fileType, 
      value: fileSize 
    });
  }
  event({
    action: 'file_upload',
    category: 'document',
    label: fileType,
    value: fileSize
  });
};

export const trackAnalysisComplete = (documentType: string, processingTime: number) => {
  event({
    action: 'analysis_complete',
    category: 'analysis',
    label: documentType,
    value: processingTime
  });
};

export const trackError = (errorType: string, errorMessage: string) => {
  event({
    action: 'error',
    category: 'error',
    label: `${errorType}: ${errorMessage}`
  });
};