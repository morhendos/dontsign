'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisResult } from '@/types/analysis';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
}

function DelayedText({ text, onComplete }: { text: string, onComplete?: () => void }) {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 20); // Speed of text appearing
    
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return displayText;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const [stage, setStage] = useState(0);
  const [showContainer, setShowContainer] = useState(false);

  useEffect(() => {
    // Start the entrance animation
    setTimeout(() => setShowContainer(true), 100);
  }, []);

  // Mock stages for demonstration
  const stages = [
    {
      title: 'Summary',
      text: 'We have analyzed your contract and found several key points that require attention.'
    },
    {
      title: 'Key Terms',
      items: ['Payment terms: Net 30', 'Contract duration: 12 months', 'Auto-renewal clause included']
    },
    {
      title: 'Potential Risks',
      items: ['Late payment penalties', 'Early termination fees', 'Unlimited liability clause']
    },
    {
      title: 'Recommendations',
      items: ['Review payment terms', 'Consider liability limits', 'Check renewal conditions']
    }
  ];

  const advanceStage = () => {
    if (stage < stages.length - 1) {
      setStage(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
      <div 
        className={cn(
          'bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden',
          'transition-all duration-1000 ease-in-out',
          showContainer ? 'opacity-100 scale-100' : 'opacity-0 scale-90',
          'mx-4'
        )}
      >
        <div className="p-6 space-y-4">
          {stages.slice(0, stage + 1).map((s, index) => (
            <div 
              key={index}
              className={cn(
                'transition-all duration-500',
                index === stage ? 'animate-in fade-in slide-in-from-bottom-4' : ''
              )}
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {s.title}
              </h3>
              
              {'text' in s ? (
                <p className="text-gray-700 dark:text-gray-300">
                  <DelayedText 
                    text={s.text} 
                    onComplete={advanceStage}
                  />
                </p>
              ) : (
                <ul className="space-y-2">
                  {s.items.map((item, itemIndex) => (
                    <li 
                      key={itemIndex}
                      className={cn(
                        'text-gray-700 dark:text-gray-300',
                        'animate-in fade-in slide-in-from-right-4',
                      )}
                      style={{ animationDelay: `${itemIndex * 500}ms` }}
                      onAnimationEnd={itemIndex === s.items.length - 1 ? advanceStage : undefined}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
