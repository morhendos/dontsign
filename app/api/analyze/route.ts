            importantClauses: Array.from(new Set(allImportantClauses)),
            recommendations: Array.from(new Set(allRecommendations)),
            metadata: {
              analyzedAt: new Date().toISOString(),
              documentName: filename.toString(),
              modelVersion: "gpt-3.5-turbo-1106",
              totalChunks: chunks.length
            }
          };

          // Send completion with final result
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'complete',
              stage: 'complete',
              progress: ANALYSIS_PROGRESS.COMPLETE,
              result: finalResult
            })}\n\n`
          );

          controller.close();

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
    return new Response(createErrorStream(error), { headers: responseHeaders });
  }
}