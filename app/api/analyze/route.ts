import { analyzeContract } from '@/app/actions';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const encoder = new TextEncoder();

    const sendProgress = (data: any) => {
      console.log(JSON.stringify(data)); // Keep server logging
      return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Set up the stream
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    try {
      // Initial progress
      await writer.write(sendProgress({
        type: 'progress',
        stage: 'preprocessing',
        progress: 15,
        activity: 'Starting AI analysis'
      }));

      // Analyze the contract
      const result = await analyzeContract(formData);

      // Send completion
      await writer.write(sendProgress({
        type: 'complete',
        result
      }));
    } finally {
      await writer.close();
    }

    // Return the stream
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}