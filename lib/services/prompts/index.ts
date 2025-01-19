export { promptManager } from './prompt-manager';

export async function createAnalysisPrompt(
  chunk: string,
  chunkIndex: number,
  totalChunks: number
): Promise<Array<{ role: string; content: string }>> {
  const { promptManager } = await import('./prompt-manager');

  const [systemPrompt, userPrompt] = await Promise.all([
    promptManager.getPrompt('system'),
    promptManager.getPrompt('analysis', {
      chunk,
      chunkIndex: String(chunkIndex + 1),
      totalChunks: String(totalChunks)
    })
  ]);

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];
}

export async function createSummaryPrompt(
  text: string
): Promise<Array<{ role: string; content: string }>> {
  const { promptManager } = await import('./prompt-manager');

  const summaryPrompt = await promptManager.getPrompt('summary');

  return [
    { role: 'user', content: `${summaryPrompt}\n\n${text}` }
  ];
}
