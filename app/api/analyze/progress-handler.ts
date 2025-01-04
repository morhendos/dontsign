import { ANALYSIS_PROGRESS } from '@/lib/constants';
import type { StreamController, ProgressHandler } from './types';

export function createProgressHandler(controller: StreamController): ProgressHandler {
  const sendEvent = (data: any) => {
    // Add logging for debugging
    console.log('[Server Progress]', JSON.stringify(data));
    controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
  };

  return {
    sendProgress: (stage: string, progress: number, currentChunk?: number, totalChunks?: number) => {
      const progressData = {
        type: 'progress',
        stage,
        progress,
        ...(currentChunk !== undefined && { currentChunk }),
        ...(totalChunks !== undefined && { totalChunks })
      };
      console.log('[Server Progress Update]', stage, progress, { currentChunk, totalChunks });
      sendEvent(progressData);
    },

    sendComplete: (result) => {
      console.log('[Server Complete]', { stage: 'complete', progress: ANALYSIS_PROGRESS.COMPLETE });
      sendEvent({
        type: 'complete',
        stage: 'complete',
        progress: ANALYSIS_PROGRESS.COMPLETE,
        result
      });
    },

    sendError: (error) => {
      console.log('[Server Error]', error);
      sendEvent({
        type: 'error',
        stage: 'preprocessing',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

export function createErrorStream(error: Error | unknown): ReadableStream {
  console.log('[Server Error Stream]', error);
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