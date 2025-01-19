import path from 'path';
import { promises as fs } from 'fs';
import * as Sentry from '@sentry/nextjs';
import { modelConfigs } from './config';
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

  private async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error(`Error reading file: ${filePath}`, error);
      Sentry.captureException(error, {
        tags: {
          file: filePath,
          component: 'PromptManager'
        }
      });
      throw error;
    }
  }

  async getPrompt(type: PromptType, variables?: Record<string, string>): Promise<string> {
    const cacheKey = `${type}${JSON.stringify(variables) || ''}`;
    if (this.promptCache.has(cacheKey)) {
      return this.promptCache.get(cacheKey)!;
    }

    const templatePath = path.join(process.cwd(), 'prompts', 'templates', `${type}.txt`);
    let prompt = await this.readFile(templatePath);

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
