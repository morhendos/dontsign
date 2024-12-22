import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';
import type { ProcessingMessage } from '@/types/analysis';
import type { AnalysisStage } from '../hero/hooks/useContractAnalysis';

interface ProcessingMessagesProps {
  messages: ProcessingMessage[];
  isAnalyzing: boolean;
  stage: AnalysisStage;
  progress: number;
}

export function ProcessingMessages({ 
  messages,
  isAnalyzing,
  stage,
  progress 
}: ProcessingMessagesProps) {
  // Only show last 5 messages to avoid cluttering the UI
  const recentMessages = messages.slice(-5);

  return (
    <div className="mt-6 space-y-2 max-w-2xl mx-auto">
      <AnimatePresence>
        {recentMessages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`
              flex items-center gap-3 px-4 py-2 rounded-md
              ${message.status === 'completed' 
                ? 'text-gray-500 dark:text-gray-400' 
                : 'text-gray-900 dark:text-gray-100'
              }
              ${message.type === 'analysis' 
                ? 'bg-blue-50 dark:bg-blue-900/30' 
                : 'bg-gray-50 dark:bg-gray-800/30'
              }
            `}
          >
            {message.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-blue-500" />
            )}
            <span className="flex-1">{message.text}</span>
            {message.status === 'active' && (
              <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}