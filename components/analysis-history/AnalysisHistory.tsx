'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoredAnalyses, deleteAnalysis, type StoredAnalysis } from '@/lib/storage';

interface AnalysisHistoryProps {
  onSelect: (analysis: StoredAnalysis) => void;
}

export function AnalysisHistory({ onSelect }: AnalysisHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnalyses(getStoredAnalyses());
      // Start entrance animation
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleDelete = (id: string) => {
    deleteAnalysis(id);
    setAnalyses(getStoredAnalyses());
  };

  const handleSelect = (analysis: StoredAnalysis) => {
    onSelect(analysis);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 300); // Wait for exit animation
  };

  return (
    <>
      {/* Toggle button */}
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <History className="w-4 h-4" />
        Previous Analyses
      </Button>

      {/* Modal */}
      {isOpen && (
        <div 
          className={cn(
            'fixed inset-0 z-50 bg-black/20 backdrop-blur-sm',
            'flex items-center justify-center',
            'transition-opacity duration-300',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
          onClick={handleClose}
        >
          <div 
            className={cn(
              'w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl',
              'p-6 m-4 space-y-4 relative',
              'transition-all duration-300',
              isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            )}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Analysis History
            </h2>

            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                {analyses.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No previous analyses found
                  </p>
                ) : (
                  analyses.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        'p-4 rounded-lg border border-gray-200 dark:border-gray-700',
                        'hover:border-blue-300 dark:hover:border-blue-700',
                        'transition-colors',
                        'space-y-2',
                        'animate-in fade-in slide-in-from-bottom-2 duration-300'
                      )}
                      style={{
                        animationDelay: '100ms'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.fileName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Analyzed {new Date(item.analyzedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSelect(item)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  );
}
