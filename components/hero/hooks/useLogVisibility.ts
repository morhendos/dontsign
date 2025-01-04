import { useState, useRef, useEffect } from 'react';

type HideReason = 'hover' | 'auto' | null;

interface UseLogVisibilityProps {
  /** Time in ms to wait before hiding after hover ends */
  hoverHideDelay?: number;
  /** Time in ms to wait before auto-hiding when inactive */
  autoHideDelay?: number;
  /** Optional array of entries to check for loading state */
  entries?: Array<{ status: string }>;
}

interface LogVisibilityState {
  /** Current visibility state of the log */
  isVisible: boolean;
  /** Handler for visibility changes (e.g., from hover) */
  onVisibilityChange: (visible: boolean) => void;
  /** Force show the log */
  show: () => void;
}

/**
 * Custom hook to manage log visibility with intelligent auto-hide behavior.
 */
export function useLogVisibility({
  hoverHideDelay = 150,
  autoHideDelay = 3000, // Increased from 2000 to give more time to read messages
  entries = []
}: UseLogVisibilityProps = {}): LogVisibilityState {
  const [isVisible, setIsVisible] = useState(true); // Changed default to true
  const [isHovered, setIsHovered] = useState(false);
  
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const hideReasonRef = useRef<HideReason>(null);
  const isHoveredRef = useRef(false);
  const entriesRef = useRef(entries);

  // Keep refs in sync with props
  useEffect(() => {
    isHoveredRef.current = isHovered;
    entriesRef.current = entries;
  }, [isHovered, entries]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
      hideReasonRef.current = null;
    }
  };

  const hasLoadingEntries = () => {
    return entriesRef.current.some(entry => entry.status === 'active');
  };

  const setHideTimeout = (delay: number, reason: HideReason) => {
    // Don't override hover timeout with auto-hide
    if (hideReasonRef.current === 'hover' && reason === 'auto') {
      return;
    }

    clearHideTimeout();
    
    hideReasonRef.current = reason;
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveredRef.current && !hasLoadingEntries()) {
        setIsVisible(false);
        hideReasonRef.current = null;
      }
    }, delay);
  };

  const onVisibilityChange = (visible: boolean) => {
    setIsHovered(visible);
    
    if (visible) {
      clearHideTimeout();
      setIsVisible(true);
    } else if (!hasLoadingEntries()) {
      setHideTimeout(hoverHideDelay, 'hover');
    }
  };

  const show = () => {
    setIsVisible(true);
    if (!isHovered && !hasLoadingEntries()) {
      setHideTimeout(autoHideDelay, 'auto');
    }
  };

  // Monitor entries for changes
  useEffect(() => {
    if (entries.some(entry => entry.status === 'active')) {
      clearHideTimeout();
      setIsVisible(true);
    } else if (!isHovered) {
      setHideTimeout(autoHideDelay, 'auto');
    }
  }, [entries, autoHideDelay, isHovered]);

  return {
    isVisible,
    onVisibilityChange,
    show
  };
}
