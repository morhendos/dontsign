import { analyzeContract } from '@/app/actions';
import { Readable } from 'stream';

function streamResponse(writer: WritableStreamDefaultWriter<Uint8Array>) {
  return (message: string) => {
    writer.write(new TextEncoder().encode(`data: ${message}\n\n`));
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const encoder = new TextEncoder();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const originalLog = console.log;

  try {
    // Override console.log to intercept progress messages
    console.log = function(data) {
      if (typeof data === 'string' && data.startsWith('{')) {
        writer.write(encoder.encode(`data: ${data}\n\n`));
      }
      originalLog.apply(console, arguments);
    };

    const result = await analyzeContract(formData);
    writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`));

  } catch (error) {
    writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`));
  } finally {
    console.log = originalLog;
    writer.close();
  }

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
