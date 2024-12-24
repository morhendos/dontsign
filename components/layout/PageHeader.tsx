import { AnalysisHistory } from '../analysis-history/AnalysisHistory';
import type { StoredAnalysis } from '@/lib/storage';

interface PageHeaderProps {
  hasHistory: boolean;
  onSelectHistory: (analysis: StoredAnalysis) => void;
}

export function PageHeader({ hasHistory, onSelectHistory }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-12 relative">
      <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white text-center mb-4">
        Don't Sign Until<br />You're Sure
      </h1>

      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl text-center">
        Upload your contract, let AI highlight the risks and key terms.
      </p>

      {hasHistory && (
        <div className="absolute right-0 top-0">
          <AnalysisHistory onSelect={onSelectHistory} />
        </div>
      )}
    </div>
  );
}
