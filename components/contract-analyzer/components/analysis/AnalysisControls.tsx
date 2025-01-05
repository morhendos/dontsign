import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { AnalysisHistory } from '@/components/analysis-history/AnalysisHistory';
import type { StoredAnalysis } from '../../types';

interface AnalysisControlsProps {
  hasStoredAnalyses: boolean;
  onSelectStoredAnalysis: (analysis: StoredAnalysis) => void;
}

export const AnalysisControls = ({
  hasStoredAnalyses,
  onSelectStoredAnalysis,
}: AnalysisControlsProps) => {
  if (!hasStoredAnalyses) return null;

  return (
    <div className="mb-8 flex justify-center">
      <AnalysisHistory onSelect={onSelectStoredAnalysis}>
        <Button
          variant="outline"
          size="lg"
          className="gap-2 border-gray-300 dark:border-gray-700"
        >
          <History className="w-5 h-5" />
          Previous Analyses
        </Button>
      </AnalysisHistory>
    </div>
  );
};