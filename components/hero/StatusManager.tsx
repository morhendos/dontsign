import { useRef, useCallback } from 'react';

interface StatusManagerProps {
  onStatusUpdate: (status: string, duration?: number) => void;
}

/**
 * Manages status updates with automatic timeout functionality
 */
export const useStatusManager = ({ onStatusUpdate }: StatusManagerProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setStatusWithTimeout = useCallback((status: string, duration = 2000) => {
    // Update the status
    onStatusUpdate(status, duration);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    
    // Set new timeout to clear the status
    timeoutRef.current = setTimeout(() => {
      onStatusUpdate('');
      timeoutRef.current = undefined;
    }, duration);
  }, [onStatusUpdate]);

  return { setStatusWithTimeout };
};