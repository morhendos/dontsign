"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalysisResult {
  summary: string;
  keyTerms: string[];
  potentialRisks: string[];
  importantClauses: string[];
  recommendations?: string[];
}

interface AnalysisMetadata {
  analyzedAt: string;
  documentName: string;
  modelVersion: string;
}

// Add retry logic for API failures
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error("Max retry attempts reached");
}

// Simple rate limiting implementation
const rateLimiter = new Map<string, number>();
function checkRateLimit(userId: string, limit = 10): boolean {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || 0;
  if (userRequests >= limit) return false;
  rateLimiter.set(userId, userRequests + 1);
  setTimeout(() => rateLimiter.set(userId, userRequests), 3600000); // Reset after 1 hour
  return true;
}

// Function to split text into chunks
function splitIntoChunks(text: string, maxChunkSize: number = 12000): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentChunkSize = 0;

  for (const word of words) {
    // Approximate token count (rough estimate: 4 characters = 1 token)
    const wordTokens = Math.ceil((word.length + 1) / 4);
    
    if (currentChunkSize + wordTokens > maxChunkSize) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [word];
      currentChunkSize = wordTokens;
    } else {
      currentChunk.push(word);
      currentChunkSize += wordTokens;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}

// Function to analyze a single chunk
async function analyzeChunk(chunk: string, isFirstChunk: boolean = false): Promise<AnalysisResult> {
  const systemPrompt = `You are an expert legal document analyzer. Analyze contracts for key terms, 
  potential risks, and important clauses. Provide clear, actionable insights while maintaining 
  confidentiality. Focus on practical implications and potential concerns.`;

  const userPrompt = `Analyze this ${isFirstChunk ? 'contract' : 'contract section'} with special attention to:
  1. Unusual or potentially unfair terms
  2. Hidden obligations or liabilities
  3. Missing standard protections
  4. Time-sensitive requirements
  5. Termination conditions
  
  Content:
  ${chunk}
  
  Provide a structured analysis in JSON format with these sections:
  - summary (brief overview)
  - keyTerms (array of important terms found in this section)
  - potentialRisks (array of identified risks)
  - importantClauses (array of critical clauses)
  - recommendations (array of suggested actions or modifications)`;

  const response = await withRetry(async () => {
    return await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });
  });

  if (!response?.choices[0]?.message?.content) {
    throw new Error("No analysis generated");
  }

  return JSON.parse(response.choices[0].message.content);
}

// Function to merge multiple analysis results
function mergeAnalysisResults(results: AnalysisResult[]): AnalysisResult {
  const merged: AnalysisResult = {
    summary: results[0].summary, // Keep the first summary as main summary
    keyTerms: [],
    potentialRisks: [],
    importantClauses: [],
    recommendations: [],
  };

  for (const result of results) {
    merged.keyTerms.push(...(result.keyTerms || []));
    merged.potentialRisks.push(...(result.potentialRisks || []));
    merged.importantClauses.push(...(result.importantClauses || []));
    if (result.recommendations) {
      merged.recommendations?.push(...result.recommendations);
    }
  }

  // Remove duplicates
  merged.keyTerms = Array.from(new Set(merged.keyTerms));
  merged.potentialRisks = Array.from(new Set(merged.potentialRisks));
  merged.importantClauses = Array.from(new Set(merged.importantClauses));
  if (merged.recommendations) {
    merged.recommendations = Array.from(new Set(merged.recommendations));
  }

  return merged;
}

export async function analyzeContract(formData: FormData) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key is not configured. Please contact the administrator."
    );
  }

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  let fileContent: string;
  try {
    fileContent = await file.text();
  } catch (error) {
    console.error("Error reading file:", error);
    throw new Error("Failed to read file content");
  }

  if (!fileContent?.trim()) throw new Error("File content is empty");

  try {
    // Split the content into manageable chunks
    const chunks = splitIntoChunks(fileContent);
    
    // Analyze each chunk
    const analysisResults = await Promise.all(
      chunks.map((chunk, index) => analyzeChunk(chunk, index === 0))
    );

    // Merge the results
    const mergedAnalysis = mergeAnalysisResults(analysisResults);

    // Add metadata
    return {
      ...mergedAnalysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        documentName: file.name,
        modelVersion: "gpt-3.5-turbo-1106",
      } as AnalysisMetadata,
    };
  } catch (error) {
    console.error("Error generating analysis:", error);
    throw new Error(
      `Failed to analyze contract: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}