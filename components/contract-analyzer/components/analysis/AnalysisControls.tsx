import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import { AnalysisHistory } from '@/components/analysis-history/AnalysisHistory';
import { cn } from '@/lib/utils';
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
    <div className="fixed right-6 top-6 z-10">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <AnalysisHistory onSelect={onSelectStoredAnalysis}>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'w-10 h-10 rounded-full shadow-md',
                    'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
                    'border border-gray-200 dark:border-gray-700',
                    'hover:bg-gray-50 dark:hover:bg-gray-700/90',
                    'transition-all duration-200 ease-in-out',
                  )}
                >
                  <History className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </Button>
              </AnalysisHistory>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-sm">
            View Previous Analyses
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};