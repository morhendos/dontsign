import OpenAI from 'openai';
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
  public async createChatCompletion(params: {
    model: string;
    temperature: number;
    max_tokens: number;
    response_format: { type: 'json_object' | 'text' };
    messages: { role: string; content: string; }[];
  }) {
    return this.circuitBreaker.execute(async () => {
      try {
        return await this.withRetry(() => 
          // We know our params are correct, so we can cast here
          this.client.chat.completions.create(params as any)
        );
      } catch (error) {
        if (error instanceof OpenAI.APIError) {
          if (error.status === 429) {
            throw new RateLimitError(error.message);
          }
          if (error.status >= 500) {
            throw new AIServiceError(error.message);
          }
          throw error;
        }
        throw error;
      }
    });
  }

  public getMetrics() {
    return this.circuitBreaker.getMetrics();
  }

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

        if (error instanceof OpenAI.APIError) {
          if (error.status === 400) throw error;
          if (error.status === 401) throw error;
          if (error.status === 404) throw error;
        }

        if (attempt === maxAttempts) break;

        const backoffTime = Math.pow(2, attempt - 1) * 1000;
        const jitter = Math.random() * 1000;
        
        await new Promise(resolve => 
          setTimeout(resolve, backoffTime + jitter)
        );
      }
    }
    
    throw lastError;
  }
}

export const openAIService = new OpenAIService(
  process.env.OPENAI_API_KEY ?? ''
);