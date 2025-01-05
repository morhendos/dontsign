import { useCallback } from 'react';

interface StatusManagerProps {
  onStatusUpdate: (status: string) => void;
}

/**
 * Manages status updates
 */
export const useStatusManager = ({ onStatusUpdate }: StatusManagerProps) => {
  const setStatus = useCallback((status: string) => {
    onStatusUpdate(status);
  }, [onStatusUpdate]);

  return { setStatus };
};
