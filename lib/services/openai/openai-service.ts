import OpenAI from 'openai';
import * as Sentry from '@sentry/nextjs';
import { promptManager } from '../prompts';
import { ContractAnalysisError } from '@/lib/errors';
import type { OpenAIMessage } from './types';

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private async createChatCompletion(
    messages: OpenAIMessage[],
    type: 'analysis' | 'summary'
  ) {
    try {
      const config = await promptManager.getModelConfig(type);

      const completion = await this.client.chat.completions.create({
        messages,
        ...config
      });

      return completion;
    } catch (error) {
      console.error('OpenAI API error:', error);
      Sentry.captureException(error, {
        tags: {
          component: 'OpenAIService',
          operation: 'createChatCompletion'
        }
      });

      throw new ContractAnalysisError(
        'Failed to analyze contract',
        'API_ERROR',
        error
      );
    }
  }

  async analyzeChunk(chunk: string, chunkIndex: number, totalChunks: number) {
    const { createAnalysisPrompt } = await import('../prompts');
    const messages = await createAnalysisPrompt(chunk, chunkIndex, totalChunks);
    const response = await this.createChatCompletion(messages, 'analysis');

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new ContractAnalysisError('No analysis generated', 'API_ERROR');
    }

    return JSON.parse(content);
  }

  async generateSummary(text: string) {
    const { createSummaryPrompt } = await import('../prompts');
    const messages = await createSummaryPrompt(text);
    const response = await this.createChatCompletion(messages, 'summary');

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new ContractAnalysisError('No summary generated', 'API_ERROR');
    }

    return content.trim();
  }
}

export const openAIService = new OpenAIService();
