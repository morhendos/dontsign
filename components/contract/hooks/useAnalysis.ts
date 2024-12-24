import { useState } from 'react';
import type { AnalysisStage, AnalysisResult } from '@/types/analysis';

interface UseAnalysisProps {
  onStatusUpdate?: (status: string, duration?: number) => void;
  onEntryComplete?: () => void;
}

interface AnalysisStreamResponse {
  type: 'update' | 'complete' | 'error';
  progress?: number;
  stage?: AnalysisStage;
  currentChunk?: number;
  totalChunks?: number;
  result?: AnalysisResult;
  error?: string;
}

export function useAnalysis({ 
  onStatusUpdate,
  onEntryComplete
}: UseAnalysisProps = {}) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<ErrorDisplay | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<AnalysisStage>('preprocessing');

  const handleAnalyze = async (file: File | null) => {
    // ... Analysis logic remains the same
    // Just moved from useContractAnalysis.ts
  };

  return {
    analysis,
    isAnalyzing,
    error,
    progress,
    stage,
    handleAnalyze
  };
}