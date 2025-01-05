import { useRef, useCallback } from 'react';
import type { SetStatusOptions } from './hooks/useFileHandler';

interface StatusManagerProps {
  onStatusUpdate: (status: string, options?: SetStatusOptions) => void;
}

/**
 * Manages status updates with automatic timeout functionality
 */
export const useStatusManager = ({ onStatusUpdate }: StatusManagerProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setStatusWithTimeout = useCallback((status: string, options: SetStatusOptions = {}) => {
    const { type = 'temporary', duration = 2000 } = options;
    
    // Update the status
    onStatusUpdate(status, { type, duration });
    
    // Only set timeout for temporary messages
    if (type === 'temporary') {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      
      // Set new timeout to clear the status
      timeoutRef.current = setTimeout(() => {
        onStatusUpdate('', { type: 'temporary' });
        timeoutRef.current = undefined;
      }, duration);
    }
  }, [onStatusUpdate]);

  return { setStatusWithTimeout };
};
