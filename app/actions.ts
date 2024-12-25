"use server";

import * as Sentry from "@sentry/nextjs";
import { ContractAnalysisError } from "@/lib/errors";
import { splitIntoChunks } from "@/lib/text-utils";
import { openAIService } from "@/lib/services/openai/openai-service";

interface ProgressUpdate {
  type: 'progress';
  progress: number;
  currentChunk?: number;
  totalChunks?: number;
  stage?: string;
  activity?: string;
}

function sendProgress(data: Partial<ProgressUpdate>) {
  console.log(JSON.stringify({
    type: 'progress',
    stage: data.progress && data.progress >= 100 ? 'complete' : 
           data.progress && data.progress <= 15 ? 'preprocessing' : 'analyzing',
    ...data
  }));
}

async function analyzeChunk(chunk: string, chunkIndex: number, totalChunks: number) {
  const response = await openAIService.createChatCompletion({
    model: "gpt-3.5-turbo-1106",
    messages: [
      { role: "system", content: "You are a legal expert. Analyze this contract section concisely." },
      { role: "user", content: `Section ${chunkIndex + 1}/${totalChunks}:\n${chunk}\n\nProvide JSON with: summary (brief), keyTerms, potentialRisks, importantClauses, recommendations.` },
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new ContractAnalysisError('No analysis generated', 'API_ERROR');
  return JSON.parse(content);
}

export async function analyzeContract(formData: FormData) {
  try {
    const text = formData.get("text");
    const filename = formData.get("filename");
    if (!text || typeof text !== 'string' || !filename || typeof filename !== 'string') {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    // Initial phase
    sendProgress({ progress: 15, activity: "Starting AI analysis" });
    await new Promise(resolve => setTimeout(resolve, 200));

    const results = [];
    const metadata = {
      analyzedAt: new Date().toISOString(),
      documentName: filename,
      modelVersion: "gpt-3.5-turbo-1106",
      totalChunks: chunks.length,
      currentChunk: 0
    };

    // Process chunks (15-80%)
    const progressPerChunk = 65 / chunks.length;
    let currentProgress = 15;

    for (let i = 0; i < chunks.length; i += 1) {
      results.push(await analyzeChunk(chunks[i], i, chunks.length));
      metadata.currentChunk = i + 1;
      currentProgress += progressPerChunk;

      sendProgress({
        progress: Math.min(Math.round(currentProgress), 80),
        currentChunk: metadata.currentChunk,
        totalChunks: metadata.totalChunks,
        activity: `Processing section ${metadata.currentChunk} of ${metadata.totalChunks}`
      });
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Merging phase (80-100%)
    const mergeSteps = [
      { progress: 82, activity: "Processing summaries" },
      { progress: 85, activity: "Consolidating key terms" },
      { progress: 88, activity: "Merging risk analysis" },
      { progress: 91, activity: "Reviewing clauses" },
      { progress: 94, activity: "Combining recommendations" },
      { progress: 97, activity: "Finalizing output" }
    ];

    for (const step of mergeSteps) {
      sendProgress(step);
      await new Promise(resolve => setTimeout(resolve, 300)); // Longer delay for visibility
    }

    // Prepare final analysis
    const finalAnalysis = {
      summary: `Analysis complete. Found ${results.length} key sections.\n\n\nDetailed Analysis:\n${results.map(r => r.summary).join('\n')}`,
      keyTerms: [...new Set(results.flatMap(r => r.keyTerms))],
      potentialRisks: [...new Set(results.flatMap(r => r.potentialRisks))],
      importantClauses: [...new Set(results.flatMap(r => r.importantClauses))],
      recommendations: [...new Set(results.flatMap(r => r.recommendations || []))],
      metadata
    };

    sendProgress({ progress: 100, activity: "Analysis complete" });
    return finalAnalysis;

  } catch (error) {
    console.error("Error in analyzeContract:", error);
    throw error;
  }
}