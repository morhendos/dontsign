import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
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

function EmptyDocumentError() {
  return (
    <div className="p-6 max-w-2xl mx-auto text-center">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Empty Document</AlertTitle>
        <AlertDescription>
          We couldn't detect any text in this document. Please make sure the document contains readable text and try again.
        </AlertDescription>
      </Alert>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        Common reasons for this:
        <ul className="list-disc text-left mt-2 pl-4">
          <li>The document is image-based (scanned) rather than text-based</li>
          <li>The PDF is password protected</li>
          <li>The file is corrupted or empty</li>
        </ul>
      </p>
    </div>
  );
}

function NonLegalDocumentError({ message }: { message: string }) {
  return (
    <div className="p-6 max-w-2xl mx-auto text-center">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unsupported Document Type</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        This tool is designed specifically for legal documents such as:
        <ul className="list-disc text-left mt-2 pl-4">
          <li>Contracts and Agreements</li>
          <li>NDAs and Confidentiality Agreements</li>
          <li>Terms of Service</li>
          <li>Legal Policies and Procedures</li>
        </ul>
      </p>
    </div>
  );
}

export const AnalysisResults = ({
  analysis,
  error,
  onClose
}: AnalysisResultsProps) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    // Save current scroll position
    const scrollPos = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPos}px`;
    document.body.style.width = '100%';

    return () => {
      // Restore scroll position on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPos);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-hidden touch-none"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card 
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 shadow-xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="absolute right-4 top-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <ScrollArea className="h-[80vh] p-6 touch-auto">
          {error ? (
            error.type === 'INVALID_INPUT' ? (
              <EmptyDocumentError />
            ) : error.type === 'INVALID_DOCUMENT_TYPE' ? (
              <NonLegalDocumentError message={error.message} />
            ) : (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )
          ) : analysis ? (
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
          ) : null}
        </ScrollArea>
      </Card>
    </div>
  );
};