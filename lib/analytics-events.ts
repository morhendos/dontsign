import { event as trackEvent } from './analytics';

// Analysis events
export function trackAnalysisStart(fileType: string) {
  trackEvent({
    action: 'analysis_start',
    category: 'analysis',
    label: fileType
  });
}

export function trackAnalysisComplete(fileType: string, duration: number) {
  trackEvent({
    action: 'analysis_complete',
    category: 'analysis',
    label: fileType,
    value: Math.round(duration)
  });
}

// Upload events
export function trackUploadStart(fileType: string) {
  trackEvent({
    action: 'upload_start',
    category: 'upload',
    label: fileType
  });
}

export function trackUploadError(error: string) {
  trackEvent({
    action: 'upload_error',
    category: 'upload',
    label: error
  });
}

// Error events
export function trackError(code: string, message: string) {
  trackEvent({
    action: 'error',
    category: 'error',
    label: `${code}: ${message}`
  });
}