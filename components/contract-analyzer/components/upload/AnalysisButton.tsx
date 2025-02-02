import { Button } from '@/components/ui/button';
import { PlayIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AnalysisButtonProps {
  onClick?: () => void;
  isAnalyzing: boolean;
  disabled?: boolean;
  hasAcceptedDisclaimer: boolean;
}

export const AnalysisButton = ({
  onClick,
  isAnalyzing,
  disabled,
  hasAcceptedDisclaimer
}: AnalysisButtonProps) => {
  const button = (
    <Button
      onClick={onClick}
      disabled={disabled || isAnalyzing || !hasAcceptedDisclaimer}
      className={`w-full sm:w-auto flex items-center justify-center gap-2 ${!hasAcceptedDisclaimer ? 'opacity-50 cursor-not-allowed' : ''}`}
      variant={hasAcceptedDisclaimer ? "default" : "secondary"}
    >
      <PlayIcon className="h-4 w-4" />
      {isAnalyzing ? 'Analyzing...' : 'Analyze Contract'}
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