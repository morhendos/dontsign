'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisResult } from '@/types/analysis';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  onClose?: () => void;
}

export function AnalysisResults({ analysis, onClose }: AnalysisResultsProps) {
  const [stage, setStage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isWidthExpanded, setIsWidthExpanded] = useState(false);

  useEffect(() => {
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
  }, []);

  const startContentSequence = () => {
    const interval = setInterval(() => {
      setStage(prev => {
        if (prev < 4) { // 4 sections total
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 300); // Delay between sections

    return () => clearInterval(interval);
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

  return (
    <div 
      className={cn(
        'fixed inset-0 flex items-center justify-center z-50',
        'bg-black/20 backdrop-blur-sm',
        'transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div 
        className={cn(
          'bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden',
          'transition-all duration-500 ease-out',
          'mx-4 min-h-[4rem]',
          isWidthExpanded ? 'w-full max-w-3xl' : 'w-64',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        <div 
          className={cn(
            'transition-all duration-500 ease-out',
            'origin-top',
            isWidthExpanded ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
          )}
        >
          <div className="p-8 space-y-6">
            {sections.map((section, index) => (
              <div
                key={index}
                className={cn(
                  'transition-all duration-300',
                  'origin-top',
                  index <= stage 
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
        </div>
      </div>
    </div>
  );
}
