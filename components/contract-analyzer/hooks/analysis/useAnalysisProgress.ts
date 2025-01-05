import { useCallback } from 'react';
import { AnalysisStage } from '../../types';

export interface UseAnalysisProgressOptions {
  stage: AnalysisStage;
  progress: number;
  currentChunk?: number;
  totalChunks?: number;
}

export const useAnalysisProgress = ({
  stage,
  progress,
  currentChunk,
  totalChunks
}: UseAnalysisProgressOptions) => {
  const getProgressDescription = useCallback(() => {
    if (stage === 'preprocessing') {
      if (progress <= 5) return 'Starting analysis';
      if (progress <= 15) return 'Reading file';
      return 'Preprocessing document';
    }
  
    if (stage === 'analyzing') {
      if (currentChunk && totalChunks) {
        return `Processing section ${currentChunk}/${totalChunks}`;
      }
      if (progress >= 80) return 'Generating summary';
      if (progress >= 90) return 'Preparing results';
      return 'Analyzing document';
    }
  
    if (stage === 'complete') return 'Analysis complete';
  
    return 'Processing';
  }, [stage, progress, currentChunk, totalChunks]);

  const isComplete = stage === 'complete' && progress === 100;
  const showChunks = stage === 'analyzing' && currentChunk && totalChunks;

  return {
    description: getProgressDescription(),
    isComplete,
    showChunks
  };
};
