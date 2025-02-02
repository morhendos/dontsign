import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AnalysisButtonProps {
  onClick?: () => void;
  isAnalyzing: boolean;
  isAnalyzed: boolean;
  hasAcceptedDisclaimer: boolean;
}

export const AnalysisButton = ({ 
  onClick,
  isAnalyzing,
  isAnalyzed,
  hasAcceptedDisclaimer,
}: AnalysisButtonProps) => {
  const button = (
    <Button
      onClick={onClick}
      disabled={!hasAcceptedDisclaimer}
      size="lg"
      variant="default"
      className={`
        relative min-w-[200px] font-semibold 
        bg-blue-600 hover:bg-blue-700 text-white 
        dark:bg-blue-700 dark:hover:bg-blue-800
        disabled:opacity-60 disabled:cursor-not-allowed
      `}
    >
      {isAnalyzing ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Analyzing...</span>
        </div>
      ) : isAnalyzed ? (
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>View Analysis</span>
        </div>
      ) : (
        'Analyze Contract'
      )}
    </Button>
  );

  if (!hasAcceptedDisclaimer) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>Please accept the legal disclaimer to continue</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};