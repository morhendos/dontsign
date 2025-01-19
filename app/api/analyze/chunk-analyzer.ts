import OpenAI from 'openai';
import { ContractAnalysisError } from '@/lib/errors';
import { DOCUMENT_SUMMARY_PROMPT, SUMMARY_CONFIG } from '@/lib/services/openai/prompts';
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
  
  const prompt = `Analyze the following contract text and provide a structured analysis in JSON format. 
This is chunk ${chunkIndex + 1} of ${totalChunks}.

Contract text:
${chunk}

You must respond with a valid JSON object containing these fields:
{
  "potentialRisks": ["risk 1", "risk 2", ...],
  "importantClauses": ["clause 1", "clause 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

All fields must be arrays of strings. Even if you find nothing relevant, return empty arrays, but maintain the structure.`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        role: "system",
        content: "You are a legal analysis assistant specialized in contract review. Analyze the contract and return results in JSON format. Focus on identifying potential risks, important clauses, and recommendations. Be concise and precise. Always return arrays for all fields, even if empty."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
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

  return {
    potentialRisks: parsedContent.potentialRisks || [],
    importantClauses: parsedContent.importantClauses || [],
    recommendations: parsedContent.recommendations || [],
    metadata: {
      analyzedAt: new Date().toISOString(),
      documentName: `Section ${chunkIndex + 1}`,
      modelVersion: "gpt-3.5-turbo-1106",
      totalChunks: totalChunks
    }
  };
}

export async function generateDocumentSummary(text: string): Promise<string> {
  // Take a decent amount of text from the start of the document
  const summaryText = text.slice(0, 6000);
  console.log('[Server] Generating document summary...');
  
  const response = await openai.chat.completions.create({
    ...SUMMARY_CONFIG,
    messages: [
      { role: "system", content: DOCUMENT_SUMMARY_PROMPT },
      { role: "user", content: summaryText },
    ]
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new ContractAnalysisError('No summary generated', 'API_ERROR');
  
  console.log('[Server] Generated summary:', content.trim());
  return content.trim();
}