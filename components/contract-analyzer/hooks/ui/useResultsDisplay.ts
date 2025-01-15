import { useState, useCallback } from 'react';

interface UseResultsDisplayOptions {
  onHide?: () => void;
}

export const useResultsDisplay = (options: UseResultsDisplayOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('summary');

  const show = useCallback(() => {
    setIsVisible(true);
    setActiveTab('summary');
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
    setActiveTab('summary');
    options.onHide?.();
  }, [options]);

  return {
    isVisible,
    activeTab,
    setActiveTab,
    show,
    hide,
    toggle: () => setIsVisible(prev => !prev)
  };
};