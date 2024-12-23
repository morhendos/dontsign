import { StreamController, ProgressHandler } from './types';

export function createProgressHandler(controller: StreamController): ProgressHandler {
  return {
    sendProgress: (stage: string, progress: number, currentChunk?: number, totalChunks?: number) => {
      controller.enqueue(
        `data: ${JSON.stringify({
          type: 'progress',
          stage,
          progress,
          ...(currentChunk !== undefined && { currentChunk }),
          ...(totalChunks !== undefined && { totalChunks })
        })}\n\n`
      );
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
