import { useState, useCallback } from 'react';

interface UseLogVisibilityProps {
  entries: any[];
}

export const useLogVisibility = ({ entries }: UseLogVisibilityProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const show = useCallback(() => {
    setIsVisible(true);
    // Auto-hide after 10 seconds if there are no updates
    setTimeout(() => {
      setIsVisible(false);
    }, 10000);
  }, []);

  return {
    isVisible,
    onVisibilityChange: setIsVisible,
    show,
  };
};