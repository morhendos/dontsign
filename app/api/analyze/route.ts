          } catch (error) {
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
      }
    });

    return new Response(stream, { headers: responseHeaders });

  } catch (error) {
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

    return new Response(errorStream, { headers: responseHeaders });
  }
}