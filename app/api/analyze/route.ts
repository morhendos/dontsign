import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { splitIntoChunks } from '@/lib/text-utils';
import { ContractAnalysisError } from '@/lib/errors';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BATCH_SIZE = 2;

interface AnalysisResult {
  summary: string;
  keyTerms: string[];
  potentialRisks: string[];
  importantClauses: string[];
  recommendations?: string[];
}

interface ProgressUpdate {
  type: 'progress' | 'complete' | 'error';
  stage: 'preprocessing' | 'analyzing' | 'complete';
  progress: number;
  currentChunk?: number;
  totalChunks?: number;
  result?: any;
  error?: string;
}

async function sendUpdate(
  writer: WritableStreamDefaultWriter<any>,
  update: ProgressUpdate
) {
  try {
    const encoder = new TextEncoder();
    console.log('[Server] Sending update:', update);
    await writer.write(
      encoder.encode(`data: ${JSON.stringify(update)}\n\n`)
    );
    console.log('[Server] Update sent successfully');
  } catch (error) {
    console.error('[Server] Error sending update:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log('[Server] Starting /api/analyze endpoint');
  
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  try {
    console.log('[Server] Reading form data');
    const data = await request.formData();
    const text = data.get('text');
    const filename = data.get('filename');

    if (!text || typeof text !== 'string' || !filename) {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    console.log('[Server] Starting preprocessing');
    await sendUpdate(writer, {
      type: 'progress',
      stage: 'preprocessing',
      progress: 5
    });

    // Try sending a test update immediately
    await sendUpdate(writer, {
      type: 'progress',
      stage: 'preprocessing',
      progress: 6
    });

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    console.log(`[Server] Split into ${chunks.length} chunks`);
    await sendUpdate(writer, {
      type: 'progress',
      stage: 'preprocessing',
      progress: 10,
      totalChunks: chunks.length,
      currentChunk: 0
    });

    // Test update to verify stream is working
    await sendUpdate(writer, {
      type: 'progress',
      stage: 'analyzing',
      progress: 15,
      totalChunks: chunks.length,
      currentChunk: 1
    });

    // Close the writer and return the stream
    await writer.close();
    console.log('[Server] Stream closed successfully');

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[Server] Error in analyze endpoint:', error);
    try {
      await sendUpdate(writer, {
        type: 'error',
        stage: 'preprocessing',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch (e) {
      console.error('[Server] Error sending error update:', e);
    }
    await writer.close();
    throw error;
  }
}