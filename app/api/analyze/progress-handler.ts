import { ANALYSIS_PROGRESS } from '@/lib/constants';
import type { StreamController, ProgressHandler } from './types';

export function createProgressHandler(controller: StreamController): ProgressHandler {
  const sendEvent = (data: any) => {
    controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
  };

  return {
    sendProgress: (stage: string, progress: number, currentChunk?: number, totalChunks?: number) => {
      sendEvent({
        type: 'progress',
        stage,
        progress,
        ...(currentChunk !== undefined && { currentChunk }),
        ...(totalChunks !== undefined && { totalChunks })
      });
    },

    sendComplete: (result) => {
      sendEvent({
        type: 'complete',
        stage: 'complete',
        progress: ANALYSIS_PROGRESS.COMPLETE,
        result
      });
    },

    sendError: (error) => {
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