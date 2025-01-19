import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import { CircuitBreaker } from './circuit-breaker';
import { AIServiceError, RateLimitError } from '@/lib/errors/api-errors';
import type { ModelConfig } from '../prompts/types';

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
  public async createChatCompletion(
    params: Omit<ChatCompletionCreateParamsNonStreaming, 'response_format'> & {
      response_format?: ModelConfig['response_format'];
    }
  ) {
    return this.circuitBreaker.execute(async () => {
      try {
        return await this.withRetry(() => 
          this.client.chat.completions.create(params as ChatCompletionCreateParamsNonStreaming)
        );
      } catch (error) {
        if (error instanceof OpenAI.APIError) {
          // Handle specific API errors
          if (error.status === 429) {
            throw new RateLimitError(error.message);
          }
          if (error.status >= 500) {
            throw new AIServiceError(error.message);
          }
          // For 4xx errors, throw as is (usually client's fault)
          throw error;
        }
        throw error;
      }
    });
  }

  /**
   * Gets current circuit breaker metrics
   */
  public getMetrics() {
    return this.circuitBreaker.getMetrics();
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

        // Don't retry on these errors
        if (error instanceof OpenAI.APIError) {
          // Don't retry on invalid requests
          if (error.status === 400) throw error;
          // Don't retry on auth errors
          if (error.status === 401) throw error;
          // Don't retry on not found
          if (error.status === 404) throw error;
        }

        // Last attempt - throw the error
        if (attempt === maxAttempts) break;

        // Calculate backoff time (1s, 2s, 4s, ...)
        const backoffTime = Math.pow(2, attempt - 1) * 1000;
        
        // Add some jitter to prevent all retries happening at exactly the same time
        const jitter = Math.random() * 1000;
        
        await new Promise(resolve => 
          setTimeout(resolve, backoffTime + jitter)
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