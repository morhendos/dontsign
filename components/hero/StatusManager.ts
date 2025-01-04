import { useCallback, useRef } from 'react';

interface UseStatusManagerProps {
  onStatusUpdate: (status: string) => void;
}

/**
 * Hook to manage status updates with timeouts
 */
export function useStatusManager({ onStatusUpdate }: UseStatusManagerProps) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setStatusWithTimeout = useCallback((status: string, timeout?: number) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    // Update status immediately
    onStatusUpdate(status);

    // If timeout provided, clear status after delay
    if (timeout) {
      timeoutRef.current = setTimeout(() => {
        onStatusUpdate('');
      }, timeout);
    }
  }, [onStatusUpdate]);

  return { setStatusWithTimeout };
}
