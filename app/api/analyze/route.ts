import { NextRequest } from 'next/server';
import { validateInput } from './input-validator';
import { createAnalysisStream } from './stream-handler';
import { createErrorStream } from './progress-handler';

const RESPONSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
} as const;

export async function POST(request: NextRequest) {
  try {
    const { text, filename } = await validateInput(request);
    const stream = createAnalysisStream(text, filename);
    return new Response(stream, { headers: RESPONSE_HEADERS });
  } catch (error) {
    console.error('[Server] Error in analyze endpoint:', error);
    return new Response(createErrorStream(error), { headers: RESPONSE_HEADERS });
  }
}