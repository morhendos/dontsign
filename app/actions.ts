'use server'

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { cache } from 'react'

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
async function withRetry<T>(
  fn: () => Promise<T>, 
  maxAttempts = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts) throw error
      await new Promise(resolve => setTimeout(resolve, attempt * 1000))
    }
  }
  throw new Error('Max retry attempts reached')
}

// Simple rate limiting implementation
const rateLimiter = new Map<string, number>()
function checkRateLimit(userId: string, limit = 10): boolean {
  const now = Date.now()
  const userRequests = rateLimiter.get(userId) || 0
  if (userRequests >= limit) return false
  rateLimiter.set(userId, userRequests + 1)
  setTimeout(() => rateLimiter.set(userId, userRequests), 3600000) // Reset after 1 hour
  return true
}

export async function analyzeContract(formData: FormData) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please contact the administrator.')
  }

  const file = formData.get('file') as File
  if (!file) throw new Error('No file uploaded')

  let fileContent: string
  try {
    fileContent = await file.text()
  } catch (error) {
    console.error('Error reading file:', error)
    throw new Error('Failed to read file content')
  }

  if (!fileContent?.trim()) throw new Error('File content is empty')

  try {
    const systemPrompt = `You are an expert legal document analyzer. Analyze contracts for key terms, 
    potential risks, and important clauses. Provide clear, actionable insights while maintaining 
    confidentiality. Focus on practical implications and potential concerns.`

    const userPrompt = `Analyze this contract with special attention to:
    1. Unusual or potentially unfair terms
    2. Hidden obligations or liabilities
    3. Missing standard protections
    4. Time-sensitive requirements
    5. Termination conditions
    
    Contract content:
    ${fileContent}
    
    Provide a structured JSON response with these sections:
    - summary (brief overview)
    - keyTerms (array of important terms)
    - potentialRisks (array of identified risks)
    - importantClauses (array of critical clauses)
    - recommendations (array of suggested actions or modifications)`

    const analysis = await withRetry(async () => {
      return generateText({
        model: openai('gpt-4o'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    })

    if (!analysis?.text) throw new Error('Failed to generate analysis')

    const parsedAnalysis: AnalysisResult = JSON.parse(analysis.text)
    
    return {
      ...parsedAnalysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        documentName: file.name,
        modelVersion: 'gpt-4o'
      } as AnalysisMetadata
    }

  } catch (error) {
    console.error('Error generating analysis:', error)
    throw new Error(`Failed to analyze contract: ${
      error instanceof Error ? error.message : 'Unknown error'
    }`)
  }
}