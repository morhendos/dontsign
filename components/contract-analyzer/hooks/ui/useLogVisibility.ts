import { useState, useCallback, useEffect } from 'react';

export interface UseLogVisibilityOptions {
  entries: any[];
  // Add isAnalyzing prop to track analysis state
  isAnalyzing?: boolean;
  // Optional delay for auto-hide (in ms)
  autoHideDelay?: number;
}

export const useLogVisibility = ({ 
  entries,
  isAnalyzing = false,
  autoHideDelay = 3000 // Default 3 seconds
}: UseLogVisibilityOptions) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show logs panel whenever we have entries
  useEffect(() => {
    if (entries.length > 0) {
      setIsVisible(true);
    }
  }, [entries.length]);

  // Handle auto-hide when analysis completes
  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;

    // If we were analyzing and now we're not, start the auto-hide timer
    if (!isAnalyzing && entries.length > 0) {
      hideTimeout = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
    }

    // Clear timeout if component unmounts or if analysis starts again
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [isAnalyzing, entries.length, autoHideDelay]);

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