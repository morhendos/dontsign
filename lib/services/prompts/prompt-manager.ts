import * as Sentry from '@sentry/nextjs';
import { modelConfigs } from './config';
import { templates } from './templates';
import type { PromptType, ModelConfig, AnalysisType } from './types';

export class PromptManager {
  private static instance: PromptManager;
  private promptCache = new Map<string, string>();

  private constructor() {}

  static getInstance(): PromptManager {
    if (!PromptManager.instance) {
      PromptManager.instance = new PromptManager();
    }
    return PromptManager.instance;
  }

  async getPrompt(type: PromptType, variables?: Record<string, string>): Promise<string> {
    const cacheKey = `${type}${JSON.stringify(variables) || ''}`;
    if (this.promptCache.has(cacheKey)) {
      return this.promptCache.get(cacheKey)!;
    }

    let prompt = templates[type];
    if (!prompt) {
      const error = new Error(`No template found for type: ${type}`);
      Sentry.captureException(error, {
        tags: {
          promptType: type,
          component: 'PromptManager'
        }
      });
      throw error;
    }

    if (variables) {
      prompt = Object.entries(variables).reduce((text, [key, value]) => {
        return text.replace(new RegExp(`\{\{${key}\}\}`, 'g'), value);
      }, prompt);
    }

    this.promptCache.set(cacheKey, prompt);
    return prompt;
  }

  getModelConfig(type: AnalysisType): ModelConfig {
    const config = modelConfigs[type];
    if (!config) {
      throw new Error(`No configuration found for type: ${type}`);
    }
    return config;
  }

  clearCache(): void {
    this.promptCache.clear();
  }
}

export const promptManager = PromptManager.getInstance();
