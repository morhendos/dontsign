import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { splitIntoChunks } from '@/lib/text-utils';
import { ContractAnalysisError } from '@/lib/errors';
import { waitForChunkProcessing } from './rate-limit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('[Server] OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);

const BATCH_SIZE = 2;

// ... (rest of the type definitions remain the same)

async function analyzeChunk(chunk: string, chunkIndex: number, totalChunks: number): Promise<AnalysisResult> {
  // ... (previous implementation remains the same)
}

export async function POST(request: NextRequest) {
  console.log('[Server] POST /api/analyze started');

  const responseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  try {
    console.log('[Server] Reading request form data...');
    const data = await request.formData();
    console.log('[Server] Form data received, checking content...');
    
    const text = data.get('text');
    const filename = data.get('filename');
    console.log('[Server] Text length:', text?.toString().length);
    console.log('[Server] Filename:', filename);

    if (!text || typeof text !== 'string' || !filename) {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    // Get user identifier for rate limiting
    const userId = request.ip || 'anonymous';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // ... (initial updates remain the same)

          for (let i = 0; i < chunks.length; i++) {
            const progress = Math.floor(15 + ((i + 1) / chunks.length) * 85);
            console.log(`[Server] Processing chunk ${i + 1}/${chunks.length}`);
            
            // Wait for rate limit before processing chunk
            await waitForChunkProcessing(userId);
            
            controller.enqueue(
              `data: ${JSON.stringify({
                type: 'progress',
                stage: 'analyzing',
                progress,
                totalChunks: chunks.length,
                currentChunk: i + 1
              })}\\n\\n`
            );

            try {
              // ... (rest of the chunk processing remains the same)
            } catch (error) {
              console.error(`[Server] Error analyzing chunk ${i + 1}:`, error);
              throw new ContractAnalysisError(
                `Error analyzing section ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'API_ERROR'
              );
            }
          }

          // ... (rest of the implementation remains the same)
        } catch (error) {
          // ... (error handling remains the same)
        }
      }
    });

    return new Response(stream, { headers: responseHeaders });

  } catch (error) {
    // ... (error handling remains the same)
  }
}