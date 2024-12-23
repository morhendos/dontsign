import { createProgressHandler } from './progress-handler';
import { processDocument } from './analysis-processor';

export function createAnalysisStream(
  text: string,
  filename: string
): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      const progress = createProgressHandler(controller);
      try {
        const result = await processDocument(text, filename, progress);
        progress.sendComplete(result);
      } catch (error) {
        console.error('[Server] Error in stream controller:', error);
        progress.sendError(error);
      } finally {
        controller.close();
      }
    }
  });
}
