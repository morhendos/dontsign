import { useState, useCallback } from 'react';

export const useProcessingState = () => {
  const [showResults, setShowResults] = useState(false);
  const [isProcessingNew, setIsProcessingNew] = useState(false);

  const reset = useCallback(() => {
    setShowResults(false);
    setIsProcessingNew(false);
  }, []);

  return {
    showResults,
    setShowResults,
    isProcessingNew,
    setIsProcessingNew,
    reset
  };
};
