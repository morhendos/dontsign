import { analyzeContract } from '@/app/actions';

export async function POST(request: Request) {
  const formData = await request.formData();
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  try {
    // Intercept console.log to stream progress updates
    const originalLog = console.log;
    console.log = (message) => {
      if (typeof message === 'string' && message.startsWith('{')) {
        writer.write(encoder.encode(`data: ${message}\n\n`));
      }
      // Ensure server logs are flushed immediately
      originalLog(message);
    };

    const result = await analyzeContract(formData);
    writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`));
    console.log = originalLog;

  } catch (error) {
    writer.write(encoder.encode(`data: ${JSON.stringify({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })}\n\n`));
  } finally {
    await writer.close();
  }

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
