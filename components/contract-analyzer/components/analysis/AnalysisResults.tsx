import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ErrorDisplay } from '@/components/error/ErrorDisplay';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { AnalysisResult } from '../../types';

interface AnalysisResultsProps {
  analysis: AnalysisResult | null;
  error?: {
    message: string;
    type: string;
  } | null;
  onClose: () => void;
}

export const AnalysisResults = ({
  analysis,
  error,
  onClose
}: AnalysisResultsProps) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    const scrollPos = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPos}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPos);
    };
  }, []);

  // If it's an error, we want a smaller modal that fits the content
  // If it's analysis results, we want the full-size modal
  const modalSize = error ? 'fit-content' : 'w-full max-w-4xl max-h-[90vh]';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-hidden touch-none"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card 
        className={`${modalSize} bg-white dark:bg-gray-800 shadow-xl relative overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-[2.3rem] top-[2.3rem] rounded-full h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <X className="h-3 w-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
          <span className="sr-only">Close</span>
        </Button>

        {error ? (
          // Error display - no ScrollArea needed
          <div className="p-[2.3rem]">
            <ErrorDisplay error={error} />
          </div>
        ) : analysis ? (
          // Analysis results - with ScrollArea
          <ScrollArea className="h-[80vh] p-6 touch-auto">
            <div className="space-y-8">
              {/* What is this contract? */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">What is this contract?</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-lg">
                  {analysis.summary}
                </p>
              </section>

              {/* Potential Risks */}
              <section className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-red-700 dark:text-red-400">Potential Risks</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {analysis.potentialRisks.map((risk, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">{risk}</li>
                  ))}
                </ul>
              </section>

              {/* Important Clauses */}
              <section className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">Key Dates & Requirements</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {analysis.importantClauses.map((clause, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">{clause}</li>
                  ))}
                </ul>
              </section>

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <section className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400">Next Steps</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">{rec}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Analysis Info */}
              {analysis.metadata && (
                <section className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Analysis completed at {new Date(analysis.metadata.analyzedAt).toLocaleString()}
                    {analysis.metadata.sectionsAnalyzed && ` • ${analysis.metadata.sectionsAnalyzed} sections analyzed`}
                  </p>
                </section>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </Card>
    </div>
  );
};