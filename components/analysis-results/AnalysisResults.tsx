'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisResult } from '@/types/analysis';
import { AnalysisSection } from './AnalysisSection';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    // Start the entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Progressively reveal sections
    if (isVisible && activeSection < 5) { // 5 sections total
      const timer = setTimeout(() => setActiveSection(prev => prev + 1), 400);
      return () => clearTimeout(timer);
    }
  }, [isVisible, activeSection]);

  const sections = [
    {
      id: 'summary',
      content: (
        <div className="px-6 py-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Analysis Summary</h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{analysis.summary}</p>
        </div>
      )
    },
    {
      id: 'keyTerms',
      content: (
        <AnalysisSection 
          title="Key Terms"
          items={analysis.keyTerms}
          icon={<CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
        />
      )
    },
    {
      id: 'risks',
      content: (
        <AnalysisSection 
          title="Potential Risks"
          items={analysis.potentialRisks}
          icon={<AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />}
        />
      )
    },
    {
      id: 'clauses',
      content: (
        <AnalysisSection 
          title="Important Clauses"
          items={analysis.importantClauses}
          icon={<FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
        />
      )
    },
    {
      id: 'recommendations',
      content: (
        <AnalysisSection 
          title="Recommendations"
          items={analysis.recommendations}
          icon={<Clock className="w-5 h-5 text-green-500 dark:text-green-400" />}
        />
      )
    }
  ];

  return (
    <div 
      className={cn(
        'fixed inset-0 z-40 overflow-hidden bg-black/20 backdrop-blur-sm',
        'transition-opacity duration-500',
        isVisible ? 'opacity-100' : 'opacity-0',
        !isVisible && 'pointer-events-none'
      )}
    >
      <div className="absolute inset-0" onClick={() => setIsVisible(false)} />
      <div
        className={cn(
          'absolute right-0 h-full w-full max-w-3xl bg-gray-50 dark:bg-gray-900 shadow-2xl',
          'transition-transform duration-500 ease-out',
          'overflow-y-auto',
          isVisible ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-8 space-y-6">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={cn(
                'transition-all duration-500 ease-out',
                index <= activeSection
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              )}
            >
              {section.content}
            </div>
          ))}

          {/* Metadata - appears last */}
          {activeSection >= sections.length && analysis.metadata && (
            <div 
              className={cn(
                'px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-500 dark:text-gray-400 space-y-1',
                'transition-all duration-500 ease-out',
                'opacity-0 translate-y-4 animate-in fade-in slide-in-from-bottom-4'
              )}
            >
              <p>Analysis completed on: {new Date(analysis.metadata.analyzedAt).toLocaleString()}</p>
              {analysis.metadata.totalChunks && (
                <p>Document sections analyzed: {analysis.metadata.totalChunks}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}