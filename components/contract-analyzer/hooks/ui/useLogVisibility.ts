import { useState, useCallback } from 'react';

export interface UseLogVisibilityOptions {
  entries: any[];
  autoHideDuration?: number;
}

export const useLogVisibility = ({ 
  entries, 
  autoHideDuration = 10000 
}: UseLogVisibilityOptions) => {
  const [isVisible, setIsVisible] = useState(false);

  const show = useCallback(() => {
    setIsVisible(true);
    // Auto-hide after duration if there are no updates
    setTimeout(() => {
      setIsVisible(false);
    }, autoHideDuration);
  }, [autoHideDuration]);

  return {
    isVisible,
    onVisibilityChange: setIsVisible,
    show
  };
};