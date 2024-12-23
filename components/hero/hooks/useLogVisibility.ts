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
 *
 * Features:
 * - Quick hide after hover ends (customizable delay)
 * - Auto-hide when inactive (customizable delay)
 * - Hover state takes precedence over auto-hide
 * - Stays visible when any entry is in loading state
 * - Proper cleanup of timeouts
 * - Type-safe implementation
 *
 * @example
 * ```tsx
 * const {
 *   isVisible,
 *   onVisibilityChange,
 *   show
 * } = useLogVisibility({
 *   hoverHideDelay: 150,
 *   autoHideDelay: 2000,
 *   entries: analysisEntries
 * });
 * ```
 */
export function useLogVisibility({
  hoverHideDelay = 150,
  autoHideDelay = 2000,
  entries = []
}: UseLogVisibilityProps = {}): LogVisibilityState {
  // State management
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Refs for timeout management
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const hideReasonRef = useRef<HideReason>(null);
  const isHoveredRef = useRef(false);

  // Keep hover ref in sync with state
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Cleanup on unmount
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

  /**
   * Check if any entry is in a loading state
   */
  const hasLoadingEntries = () => {
    return entries.some(entry => entry.status === 'active');
  };

  /**
   * Sets up a timeout to hide the log.
   * Hover-based hiding takes precedence over auto-hide.
   * Won't hide if any entries are in loading state.
   */
  const setHideTimeout = (delay: number, reason: HideReason) => {
    // Don't override hover timeout with auto-hide
    if (hideReasonRef.current === 'hover' && reason === 'auto') {
      return;
    }

    clearHideTimeout();
    
    hideReasonRef.current = reason;
    hideTimeoutRef.current = setTimeout(() => {
      // Only hide if:
      // 1. Not being hovered
      // 2. No entries are loading
      if (!isHoveredRef.current && !hasLoadingEntries()) {
        setIsVisible(false);
        hideReasonRef.current = null;
      }
    }, delay);
  };

  /**
   * Handler for visibility changes (e.g., from hover events)
   */
  const onVisibilityChange = (visible: boolean) => {
    setIsHovered(visible);
    
    if (visible) {
      clearHideTimeout();
      setIsVisible(true);
    } else {
      // Only start hide timeout if no entries are loading
      if (!hasLoadingEntries()) {
        setHideTimeout(hoverHideDelay, 'hover');
      }
    }
  };

  /**
   * Force show the log and set up auto-hide
   */
  const show = () => {
    setIsVisible(true);
    // Only set up auto-hide if not being hovered and no entries are loading
    if (!isHovered && !hasLoadingEntries()) {
      setHideTimeout(autoHideDelay, 'auto');
    }
  };

  // Monitor entries for loading state changes
  useEffect(() => {
    // If any entry starts loading, show the log
    if (hasLoadingEntries()) {
      clearHideTimeout(); // Cancel any pending hide
      setIsVisible(true);
    } else if (!isHovered) {
      // If nothing is loading and we're not being hovered,
      // start the auto-hide timer
      setHideTimeout(autoHideDelay, 'auto');
    }
  }, [entries, autoHideDelay]);

  return {
    isVisible,
    onVisibilityChange,
    show
  };
}
