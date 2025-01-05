import { useCallback } from 'react';

interface StatusManagerProps {
  onStatusUpdate: (status: string) => void;
}

/**
 * Manages status updates
 */
export const useStatusManager = ({ onStatusUpdate }: StatusManagerProps) => {
  const setStatusWithTimeout = useCallback((status: string) => {
    onStatusUpdate(status);
  }, [onStatusUpdate]);

  return { setStatusWithTimeout };
};
