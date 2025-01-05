import { useState, useCallback } from 'react';
import type { StatusMessage } from '../../types';

export interface UseStatusManagerOptions {
  defaultDuration?: number;
}

export const useStatusManager = (options: UseStatusManagerOptions = {}) => {
  const { defaultDuration = 3000 } = options;
  const [message, setMessage] = useState<string>('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const clearStatusTimeout = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  const setStatusWithTimeout = useCallback((status: string, duration = defaultDuration) => {
    clearStatusTimeout();
    setMessage(status);

    if (duration > 0) {
      const id = setTimeout(() => {
        setMessage('');
        setTimeoutId(null);
      }, duration);
      setTimeoutId(id);
    }
  }, [clearStatusTimeout, defaultDuration]);

  return {
    message,
    setMessage: setStatusWithTimeout,
    clearMessage: clearStatusTimeout
  };
};
