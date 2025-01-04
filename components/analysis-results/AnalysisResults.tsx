'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import type { AnalysisResult } from '@/types/analysis';
import type { AnalysisStage } from '@/components/hero/hooks/useContractAnalysis';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  onClose?: () => void;
  isAnalyzing: boolean;
  stage: AnalysisStage;
}

interface ContentSection {
  title: string;
  icon?: JSX.Element;
  items?: string[];
  content?: React.ReactNode;
}

export function AnalysisResults({ analysis, onClose, isAnalyzing, stage }: AnalysisResultsProps) {
  const [animationStage, setAnimationStage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isWidthExpanded, setIsWidthExpanded] = useState(false);
  const [shouldStartAnimation, setShouldStartAnimation] = useState(false);

  useEffect(() => {
    if (!isAnalyzing && stage === 'complete') {
      const timer = setTimeout(() => {
        setShouldStartAnimation(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, stage]);

  useEffect(() => {
    if (!shouldStartAnimation) return;

    const sequence = async () => {
      setIsVisible(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsWidthExpanded(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      startContentSequence();
    };

    sequence();
  }, [shouldStartAnimation]);

  const startContentSequence = () => {
    const interval = setInterval(() => {
      setAnimationStage(prev => {
        if (prev < 4) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 300);

    return () => clearInterval(interval);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const sections: ContentSection[] = [
    // Summary Section
    {
      title: 'Analysis Summary',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Executive Summary
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            {analysis.summary}
          </p>
        </div>
      )
    },
    // Key Terms Section
    {
      title: 'Key Terms',
      icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
      items: analysis.keyTerms || []
    },
    // Risks Section
    {
      title: 'Potential Risks',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      items: analysis.potentialRisks || []
    },
    // Recommendations Section
    {
      title: 'Recommendations',
      icon: <Clock className="w-5 h-5 text-green-500" />,
      items: analysis.recommendations || []
    }
  ];

  if (!shouldStartAnimation) return null;

  return (
    <div 
      className={cn(
        'fixed inset-0 flex items-center justify-center z-50',
        'bg-black/40 backdrop-blur-sm',
        'transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleBackdropClick}
    >
      <Card 
        className={cn(
          'absolute inset-4 md:inset-6 max-h-[90vh] flex flex-col',
          'bg-white dark:bg-gray-800/95 backdrop-blur-sm',
          'rounded-xl shadow-2xl border-0',
          'transition-all duration-500 ease-out',
          isWidthExpanded ? 'w-full max-w-4xl mx-auto' : 'w-64 mx-auto',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        {/* Header with close button */}
        <div className="sticky top-0 z-50 flex items-center justify-between p-6 bg-white dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contract Analysis
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="
              rounded-lg p-2
              text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-700
              focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700
              transition-colors
            "
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <ScrollArea
          className={cn(
            'flex-1 transition-all duration-500 ease-out',
            'origin-top',
            isWidthExpanded ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="p-6 space-y-6">
            {sections.map((section, index) => (
              <div
                key={index}
                className={cn(
                  'transition-all duration-300',
                  'origin-top',
                  index <= animationStage 
                    ? 'scale-y-100 opacity-100' 
                    : 'scale-y-0 opacity-0 h-0'
                )}
              >
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
                  {section.content || (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        {section.icon}
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {section.title}
                        </h3>
                      </div>
                      
                      {section.items && section.items.length > 0 && (
                        <ul className="space-y-3">
                          {section.items.map((item, itemIndex) => (
                            <li 
                              key={itemIndex}
                              className="text-gray-700 dark:text-gray-300 leading-relaxed pl-4 border-l-2 border-gray-200 dark:border-gray-700"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
