import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { splitIntoChunks } from '@/lib/text-utils';
import { ContractAnalysisError } from '@/lib/errors';
import { PROGRESS_STAGES, calculateChunkProgress } from '@/lib/constants';

// ... rest of the imports ...

export async function POST(request: NextRequest) {
  console.log('[Server] POST /api/analyze started');

  const responseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  try {
    // ... request validation ...

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Initial preprocessing update
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'progress',
              stage: 'preprocessing',
              progress: PROGRESS_STAGES.PREPROCESSING
            })}\n\n`
          );

          // Process text into chunks
          const chunks = splitIntoChunks(text);
          if (chunks.length === 0) {
            throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
          }

          // Start analysis phase
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'progress',
              stage: 'analyzing',
              progress: PROGRESS_STAGES.ANALYSIS_START,
              totalChunks: chunks.length,
              currentChunk: 0
            })}\n\n`
          );

          // Process chunks
          let results = [];
          for (let i = 0; i < chunks.length; i++) {
            const progress = calculateChunkProgress(i + 1, chunks.length);
            
            controller.enqueue(
              `data: ${JSON.stringify({
                type: 'progress',
                stage: 'analyzing',
                progress,
                totalChunks: chunks.length,
                currentChunk: i + 1
              })}\n\n`
            );

            const chunkAnalysis = await analyzeChunk(chunks[i], i, chunks.length);
            results.push(chunkAnalysis);
          }

          // Start summary generation
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'progress',
              stage: 'analyzing',
              progress: PROGRESS_STAGES.SUMMARY_START
            })}\n\n`
          );

          // Generate final summary
          const finalSummary = await generateFinalSummary(results);

          // Summary completed
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'progress',
              stage: 'analyzing',
              progress: PROGRESS_STAGES.SUMMARY_END
            })}\n\n`
          );

          // Prepare final result
          const finalResult = prepareFinalResult(results, finalSummary, filename);

          // Send completion
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'complete',
              stage: 'complete',
              progress: PROGRESS_STAGES.COMPLETE,
              result: finalResult
            })}\n\n`
          );

          controller.close();

        } catch (error) {
          handleStreamError(controller, error);
        }
      }
    });

    return new Response(stream, { headers: responseHeaders });

  } catch (error) {
    return handleEndpointError(error, responseHeaders);
  }
}

// Helper functions
function handleStreamError(controller: ReadableStreamDefaultController, error: unknown) {
  console.error('[Server] Error in stream controller:', error);
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

function handleEndpointError(error: unknown, headers: HeadersInit) {
  console.error('[Server] Error in analyze endpoint:', error);
  const errorStream = new ReadableStream({
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

  return new Response(errorStream, { headers });
}
