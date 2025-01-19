import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming, ChatCompletion } from 'openai/resources/chat/completions';
import { CircuitBreaker } from './circuit-breaker';
import { AIServiceError, RateLimitError } from '@/lib/errors/api-errors';

export class OpenAIService {
  private client: OpenAI;
  private circuitBreaker: CircuitBreaker;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    this.circuitBreaker = new CircuitBreaker();
  }

  public async createChatCompletion(
    params: ChatCompletionCreateParamsNonStreaming
  ): Promise<ChatCompletion> {
    return this.circuitBreaker.execute(async () => {
      try {
        return await this.withRetry(() => 
          this.client.chat.completions.create(params)
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