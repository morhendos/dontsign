import { ANALYSIS_PROGRESS } from '@/lib/constants';
import type { StreamController, ProgressHandler } from './types';

export function createProgressHandler(controller: StreamController): ProgressHandler {
  const sendEvent = (data: any) => {
    console.log('[Server Progress]', JSON.stringify(data));
    controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
  };

  return {
    sendProgress: (stage: string, progress: number, currentChunk?: number, totalChunks?: number, description?: string) => {
      const eventData = {
        type: 'update',  // Important: Keep this as 'update' to match client expectations
        stage,
        progress,
        ...(currentChunk !== undefined && { currentChunk }),
        ...(totalChunks !== undefined && { totalChunks }),
        ...(description && { description }), // Include description in event data
      };
      
      // Log the progress update with context
      console.log('[Server Progress]', {
        stage,
        progress,
        currentChunk,
        totalChunks,
        description
      });
      
      sendEvent(eventData);
    },

    sendComplete: (result) => {
      console.log('[Server Complete] Analysis finished successfully');
      sendEvent({
        type: 'complete',
        stage: 'complete',
        progress: ANALYSIS_PROGRESS.COMPLETE,
        result
      });
    },

    sendError: (error) => {
      console.error('[Server Error]', error);
      sendEvent({
        type: 'error',
        stage: 'preprocessing',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

function getProgressDescription(stage: string, progress: number, currentChunk?: number, totalChunks?: number): string {
  if (stage === 'preprocessing') {
    if (progress <= ANALYSIS_PROGRESS.STARTED) return 'Starting analysis';
    if (progress <= ANALYSIS_PROGRESS.FILE_READ) return 'Reading file';
    return 'Preprocessing document';
  }
  
  if (stage === 'analyzing') {
    if (currentChunk && totalChunks) {
      return `Processing chunk ${currentChunk}/${totalChunks}`;
    }
    if (progress >= ANALYSIS_PROGRESS.SUMMARY_START) return 'Generating summary';
    if (progress >= ANALYSIS_PROGRESS.RESULT_PREPARATION) return 'Preparing results';
    return 'Analyzing document';
  }
  
  if (stage === 'complete') return 'Analysis complete';
  
  return 'Processing';
}

export function createErrorStream(error: Error | unknown): ReadableStream {
  console.error('[Server Error Stream]', error);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(
        `data: ${JSON.stringify({
          type: 'error',
          stage: 'preprocessing',
          progress: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        })}\n\n`
      );
      controller.close();
    }
  });
}