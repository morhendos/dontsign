import { event } from './analytics';

// Event Categories
export const EventCategories = {
  DOCUMENT: 'Document',
  ANALYSIS: 'Analysis',
  ERROR: 'Error'
} as const;

// Event Actions
export const EventActions = {
  FILE_UPLOAD: 'file_upload',
  FILE_UPLOAD_ERROR: 'file_upload_error',
  ANALYSIS_START: 'analysis_start',
  ANALYSIS_COMPLETE: 'analysis_complete',
  ANALYSIS_ERROR: 'analysis_error'
} as const;

export const trackFileUpload = (fileType: string, fileSize: number, successful: boolean = true) => {
  event({
    action: successful ? EventActions.FILE_UPLOAD : EventActions.FILE_UPLOAD_ERROR,
    category: EventCategories.DOCUMENT,
    label: fileType,
    value: fileSize
  });
};

export const trackAnalysis = (
  action: typeof EventActions.ANALYSIS_START | typeof EventActions.ANALYSIS_COMPLETE,
  fileType: string,
  duration?: number
) => {
  event({
    action,
    category: EventCategories.ANALYSIS,
    label: fileType,
    value: duration
  });
};
