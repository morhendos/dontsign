import OpenAI from 'openai';
import { CircuitBreaker } from './circuit-breaker';
import { ContractAnalysisError } from '@/lib/errors';

export class OpenAIService {
  private client: OpenAI;
  private circuitBreaker: CircuitBreaker;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    this.circuitBreaker = new CircuitBreaker();
  }

  /**
   * Creates a chat completion with circuit breaker and retry protection
   */
  async createChatCompletion(params: OpenAI.ChatCompletionCreateParamsNonStreaming) {
    return this.circuitBreaker.execute(async () => {
      try {
        return await this.withRetry(() => 
          this.client.chat.completions.create(params)
        );
      } catch (error) {
        if (error instanceof OpenAI.APIError) {
          throw new ContractAnalysisError(
            `OpenAI API Error: ${error.message}`,
            'OPENAI_API_ERROR'
          );
        }
        throw error;
      }
    });
  }

  /**
   * Retries the operation with exponential backoff
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3
  ): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        // Don't retry on invalid requests
        if (error instanceof OpenAI.APIError && error.status === 400) {
          throw error;
        }
        // Last attempt - throw the error
        if (attempt === maxAttempts) break;
        // Wait with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }
    
    throw lastError;
  }
}

// Export singleton instance
export const openAIService = new OpenAIService(
  process.env.OPENAI_API_KEY ?? ''
);