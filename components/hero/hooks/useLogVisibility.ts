import { useState, useRef, useEffect } from 'react';

type HideReason = 'hover' | 'auto' | null;

interface UseLogVisibilityProps {
  /** Time in ms to wait before hiding after hover ends */
  hoverHideDelay?: number;
  /** Time in ms to wait before auto-hiding when inactive */
  autoHideDelay?: number;
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
 *   autoHideDelay: 2000
 * });
 * ```
 */
export function useLogVisibility({
  hoverHideDelay = 150,
  autoHideDelay = 2000
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
   * Sets up a timeout to hide the log.
   * Hover-based hiding takes precedence over auto-hide.
   */
  const setHideTimeout = (delay: number, reason: HideReason) => {
    // Don't override hover timeout with auto-hide
    if (hideReasonRef.current === 'hover' && reason === 'auto') {
      return;
    }

    clearHideTimeout();
    
    hideReasonRef.current = reason;
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveredRef.current) {
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
      setHideTimeout(hoverHideDelay, 'hover');
    }
  };

  /**
   * Force show the log and set up auto-hide
   */
  const show = () => {
    setIsVisible(true);
    if (!isHovered) {
      setHideTimeout(autoHideDelay, 'auto');
    }
  };

  return {
    isVisible,
    onVisibilityChange,
    show
  };
}
