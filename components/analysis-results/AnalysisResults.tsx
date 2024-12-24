'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, FileText, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AnalysisResult } from '@/types/analysis';
import type { AnalysisStage } from '@/components/hero/hooks/useContractAnalysis';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  onClose?: () => void;
  isAnalyzing: boolean;
  stage: AnalysisStage;
}

export function AnalysisResults({ analysis, onClose, isAnalyzing, stage }: AnalysisResultsProps) {
  const [animationStage, setAnimationStage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isWidthExpanded, setIsWidthExpanded] = useState(false);
  const [shouldStartAnimation, setShouldStartAnimation] = useState(false);

  useEffect(() => {
    // Wait for analysis to be completely finished
    if (!isAnalyzing && stage === 'complete') {
      // Add a small delay to ensure all data is ready
      const timer = setTimeout(() => {
        setShouldStartAnimation(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, stage]);

  useEffect(() => {
    if (!shouldStartAnimation) return;

    // Start animation sequence
    const sequence = async () => {
      // Show container
      setIsVisible(true);
      
      // Expand width first
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsWidthExpanded(true);
      
      // Start showing content after width expansion
      await new Promise(resolve => setTimeout(resolve, 500));
      startContentSequence();
    };

    sequence();
  }, [shouldStartAnimation]);

  const startContentSequence = () => {
    const interval = setInterval(() => {
      setAnimationStage(prev => {
        if (prev < 4) { // 4 sections total
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 300); // Delay between sections

    return () => clearInterval(interval);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Wait for fade-out animation before calling onClose
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const sections = [
    // Summary Section
    {
      title: 'Analysis Summary',
      content: <p className="text-gray-700 dark:text-gray-300 text-lg">{analysis.summary}</p>
    },
    // Key Terms Section
    {
      title: 'Key Terms',
      icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
      items: analysis.keyTerms
    },
    // Risks Section
    {
      title: 'Potential Risks',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      items: analysis.potentialRisks
    },
    // Recommendations Section
    {
      title: 'Recommendations',
      icon: <Clock className="w-5 h-5 text-green-500" />,
      items: analysis.recommendations
    }
  ];

  // Don't render anything until we're ready to start animations
  if (!shouldStartAnimation) return null;

  return (
    <div 
      className={cn(
        'fixed inset-0 flex items-center justify-center z-50',
        'bg-black/20 backdrop-blur-sm',
        'transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          'absolute inset-4 max-h-[90vh] flex flex-col',
          'bg-white dark:bg-gray-800 rounded-xl shadow-2xl',
          'transition-all duration-500 ease-out',
          isWidthExpanded ? 'w-full max-w-3xl mx-auto' : 'w-64 mx-auto',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="
            absolute top-4 right-4 z-50
            p-2 rounded-lg
            text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
            hover:bg-gray-100 dark:hover:bg-gray-700/50
            transition-colors
          "
        >
          <X className="w-5 h-5" />
          <span className="sr-only">Close</span>
        </button>

        <ScrollArea
          className={cn(
            'flex-1 transition-all duration-500 ease-out',
            'origin-top',
            isWidthExpanded ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="p-8 space-y-6">
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {section.icon}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                  </div>
                  
                  {'items' in section ? (
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li 
                          key={itemIndex}
                          className="text-gray-700 dark:text-gray-300"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    section.content
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
