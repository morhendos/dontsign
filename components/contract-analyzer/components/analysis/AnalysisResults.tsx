'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, []);

  const modalSize = error ? 'fit-content' : 'w-full max-w-4xl';

  const LegalWatermark = () => (
    <Alert variant="destructive" className="border-2 border-red-500 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
      <AlertDescription className="text-center font-bold text-red-700 dark:text-red-400">
        FOR INFORMATIONAL PURPOSES ONLY - NOT LEGAL ADVICE
        <p className="text-sm font-normal mt-1 text-red-600 dark:text-red-300">
          This AI-generated analysis may contain errors. Always consult with a legal professional.
        </p>
      </AlertDescription>
    </Alert>
  );

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 overflow-hidden touch-none"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="m-2 sm:m-4 w-full max-w-4xl">
        <Card 
          className={`${modalSize} bg-white dark:bg-gray-800 shadow-xl relative overflow-hidden rounded-xl`}
          onClick={e => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 z-50"
          >
            <X className="h-3 w-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            <span className="sr-only">Close</span>
          </Button>

          {error ? (
            <div className="p-6">
              <ErrorDisplay error={error} />
            </div>
          ) : analysis ? (
            <ScrollArea className="max-h-[calc(100vh-16px-16px)] sm:max-h-[calc(100vh-32px-32px)] touch-auto relative z-0">
              <div className="p-6 space-y-6">
                <section>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">What is this contract?</h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {analysis.summary}
                  </p>
                </section>

                <section className="p-5 rounded-lg border-2 border-red-200 dark:border-red-900/30 bg-gray-50 dark:bg-gray-800/50">
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">Potential Risks</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {analysis.potentialRisks.map((risk, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">{risk}</li>
                    ))}
                  </ul>
                </section>

                <section className="p-5 rounded-lg border-2 border-blue-200 dark:border-blue-900/30 bg-gray-50 dark:bg-gray-800/50">
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">Key Dates & Requirements</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {analysis.importantClauses.map((clause, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">{clause}</li>
                    ))}
                  </ul>
                </section>

                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <section className="p-5 rounded-lg border-2 border-green-200 dark:border-green-900/30 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">Next Steps</h2>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">{rec}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <LegalWatermark />

                {analysis.metadata && (
                  <section className="mt-2 pt-4 border-t border-gray-200 dark:border-gray-700">
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
    </div>
  );
};
