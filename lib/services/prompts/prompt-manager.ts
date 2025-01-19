import path from 'path';
import { promises as fs } from 'fs';
import * as Sentry from '@sentry/nextjs';

type ModelConfig = {
  model: string;
  temperature: number;
  max_tokens: number;
  response_format: { type: string };
};

type PromptType = 'system' | 'summary' | 'analysis';

export class PromptManager {
  private static instance: PromptManager;
  private promptCache = new Map<string, string>();
  private configCache: Record<string, ModelConfig> | null = null;

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

  private async loadConfig(): Promise<Record<string, ModelConfig>> {
    if (this.configCache) return this.configCache;

    const configPath = path.join(process.cwd(), 'prompts', 'config', 'models.json');
    const configContent = await this.readFile(configPath);
    this.configCache = JSON.parse(configContent);
    return this.configCache;
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

  async getModelConfig(type: 'analysis' | 'summary'): Promise<ModelConfig> {
    const config = await this.loadConfig();
    return config[type];
  }

  clearCache(): void {
    this.promptCache.clear();
    this.configCache = null;
  }
}

export const promptManager = PromptManager.getInstance();
