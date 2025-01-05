import { useState, useCallback } from 'react';

export const useResultsDisplay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('summary');

  const show = useCallback(() => {
    setIsVisible(true);
    setActiveTab('summary');
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
    setActiveTab('summary');
  }, []);

  return {
    isVisible,
    activeTab,
    setActiveTab,
    show,
    hide,
    toggle: () => setIsVisible(prev => !prev)
  };
};