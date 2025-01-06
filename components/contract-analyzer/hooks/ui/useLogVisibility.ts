import { useState, useCallback, useEffect } from 'react';

export interface UseLogVisibilityOptions {
  entries: any[];
}

export const useLogVisibility = ({ entries }: UseLogVisibilityOptions) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show logs panel whenever we have entries
  useEffect(() => {
    if (entries.length > 0) {
      setIsVisible(true);
    }
  }, [entries.length]);

  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    entries,
    isVisible,
    onVisibilityChange: setIsVisible,
    show,
    hide
  };
};