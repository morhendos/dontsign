import OpenAI from 'openai';
import { ContractAnalysisError } from '@/lib/errors';
import { promptManager } from '@/lib/services/prompts';
import type { AnalysisResult } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function validateAnalysisResult(result: any): result is Omit<AnalysisResult, 'summary'> {
  const hasArrayProperty = (obj: any, prop: string): boolean => 
    Array.isArray(obj[prop]) && obj[prop].every(item => typeof item === 'string');

  return (
    result &&
    typeof result === 'object' &&
    hasArrayProperty(result, 'potentialRisks') &&
    hasArrayProperty(result, 'importantClauses') &&
    (!result.recommendations || hasArrayProperty(result, 'recommendations'))
  );
}

export async function analyzeChunk(chunk: string, chunkIndex: number, totalChunks: number): Promise<Omit<AnalysisResult, 'summary'>> {
  console.log(`[Server] Analyzing chunk ${chunkIndex + 1}/${totalChunks}`);
  
  const [systemPrompt, analysisPrompt] = await Promise.all([
    promptManager.getPrompt('system'),
    promptManager.getPrompt('analysis', {
      chunk,
      chunkIndex: String(chunkIndex + 1),
      totalChunks: String(totalChunks)
    })
  ]);

  const config = await promptManager.getModelConfig('analysis');
  
  const response = await openai.chat.completions.create({
    ...config,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: analysisPrompt }
    ]
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new ContractAnalysisError('No analysis generated', 'API_ERROR');

  let parsedContent: any;
  try {
    parsedContent = JSON.parse(content);
  } catch (error) {
    console.error('[Server] JSON parsing error:', error);
    throw new ContractAnalysisError('Invalid JSON response from AI model', 'API_ERROR');
  }

  if (!validateAnalysisResult(parsedContent)) {
    console.error('[Server] Invalid analysis result structure:', parsedContent);
    throw new ContractAnalysisError('Invalid analysis result structure from AI model', 'API_ERROR');
  }

  const modelConfig = await promptManager.getModelConfig('analysis');

  return {
    potentialRisks: parsedContent.potentialRisks || [],
    importantClauses: parsedContent.importantClauses || [],
    recommendations: parsedContent.recommendations || [],
    metadata: {
      analyzedAt: new Date().toISOString(),
      documentName: `Section ${chunkIndex + 1}`,
      modelVersion: modelConfig.model,
      totalChunks: totalChunks
    }
  };
}

export async function generateDocumentSummary(text: string): Promise<string> {
  // Take a decent amount of text from the start of the document
  const summaryText = text.slice(0, 6000);
  console.log('[Server] Generating document summary...');
  
  const [summaryPrompt, config] = await Promise.all([
    promptManager.getPrompt('summary'),
    promptManager.getModelConfig('summary')
  ]);

  const response = await openai.chat.completions.create({
    ...config,
    messages: [
      { role: "user", content: `${summaryPrompt}\n\n${summaryText}` }
    ]
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new ContractAnalysisError('No summary generated', 'API_ERROR');
  
  console.log('[Server] Generated summary:', content.trim());
  return content.trim();
}