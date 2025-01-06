import { useState, useCallback } from 'react';
import type { StatusMessage } from '../../types';

export const useStatusManager = () => {
  const [message, setMessage] = useState<string>('');

  // Simple message setter - no auto-timeout
  const setStatus = useCallback((status: string) => {
    setMessage(status);
  }, []);

  // Clear message manually if needed
  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  return {
    message,
    setMessage: setStatus,
    clearMessage
  };
};
