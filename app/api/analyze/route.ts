import { analyzeContract } from '@/app/actions';

export const runtime = 'edge'; // Enable streaming by using the Edge Runtime

export async function POST(request: Request) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  try {
    const formData = await request.formData();
    
    // Create a progress handler that writes to the stream
    const handleProgress = async (data: any) => {
      // Also log to server console for debugging
      console.log(JSON.stringify(data));
      
      // Write to stream
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };
    
    // Analyze with progress updates
    const result = await analyzeContract(formData, handleProgress);
    
    // Send final completion message
    await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`));
    
  } catch (error) {
    console.error('API Error:', error);
    // Send error through stream
    await writer.write(encoder.encode(`data: ${JSON.stringify({
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
      'X-Accel-Buffering': 'no', // Disable buffering
    },
  });
}