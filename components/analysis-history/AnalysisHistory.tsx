'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { History, Trash2, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoredAnalyses, deleteAnalysis } from '@/lib/storage';
import type { StoredAnalysis } from '@/types/storage';

interface AnalysisHistoryProps {
  onSelect: (analysis: StoredAnalysis) => void;
  children?: React.ReactNode;
}

export function AnalysisHistory({ onSelect, children }: AnalysisHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setAnalyses(getStoredAnalyses());
      // Start entrance animation
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAnalysis(id);
    setAnalyses(getStoredAnalyses());
  };

  const handleSelect = (analysis: StoredAnalysis) => {
    onSelect(analysis);
    handleClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    document.body.style.overflow = '';
    setTimeout(() => setIsOpen(false), 300); // Wait for exit animation
  };

  return (
    <div onClick={() => setIsOpen(true)}>
      {children}

      {/* Modal */}
      {isOpen && (
        <div 
          className={cn(
            'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm touch-none',
            'flex items-center justify-center',
            'transition-opacity duration-300',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
          onClick={handleClose}
        >
          <Card
            className={cn(
              'absolute inset-4 md:inset-auto md:w-full md:max-w-2xl max-h-[90vh] flex flex-col touch-auto',
              'bg-white dark:bg-gray-800/95 backdrop-blur-sm',
              'rounded-xl shadow-2xl border-0',
              'transition-all duration-300',
              isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            )}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-50 flex items-center justify-between p-6 bg-white dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <History className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                Analysis History
              </h2>
              <button
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

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4">
                {analyses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400 space-y-4">
                    <FileText className="w-12 h-12 mx-auto opacity-50" />
                    <p className="text-lg">No previous analyses found</p>
                    <p className="text-sm">Analyzed contracts will appear here</p>
                  </div>
                ) : (
                  analyses.map((item, index) => (
                    <div 
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'p-4 rounded-lg border border-gray-200 dark:border-gray-700',
                        'hover:border-blue-300 dark:hover:border-blue-700',
                        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                        'cursor-pointer select-none',
                        'transition-all duration-200',
                        'group',
                        'animate-in fade-in slide-in-from-bottom-2'
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.fileName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Analyzed {new Intl.DateTimeFormat('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            }).format(new Date(item.analyzedAt))}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="
                              p-2 rounded-lg
                              text-gray-400 hover:text-red-600 
                              dark:text-gray-500 dark:hover:text-red-400
                              hover:bg-red-50 dark:hover:bg-red-900/30
                              focus:outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800
                              transition-colors
                            "
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete analysis</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
}
