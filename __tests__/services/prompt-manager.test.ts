import { promptManager } from '@/lib/services/prompts';
import { promises as fs } from 'fs';
import path from 'path';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe('PromptManager', () => {
  beforeEach(() => {
    promptManager.clearCache();
    (fs.readFile as jest.Mock).mockClear();
  });

  describe('getPrompt', () => {
    it('should load and cache prompts', async () => {
      const mockPrompt = 'test prompt content';
      (fs.readFile as jest.Mock).mockResolvedValue(mockPrompt);

      const prompt1 = await promptManager.getPrompt('system');
      const prompt2 = await promptManager.getPrompt('system');

      expect(prompt1).toBe(mockPrompt);
      expect(prompt2).toBe(mockPrompt);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should replace variables in prompts', async () => {
      const templatePrompt = 'Hello {{name}}, section {{num}}';
      (fs.readFile as jest.Mock).mockResolvedValue(templatePrompt);

      const prompt = await promptManager.getPrompt('analysis', {
        name: 'User',
        num: '1',
      });

      expect(prompt).toBe('Hello User, section 1');
    });

    it('should handle missing variables gracefully', async () => {
      const templatePrompt = 'Hello {{name}}';
      (fs.readFile as jest.Mock).mockResolvedValue(templatePrompt);

      const prompt = await promptManager.getPrompt('analysis', {});

      expect(prompt).toBe('Hello {{name}}');
    });
  });

  describe('getModelConfig', () => {
    it('should load and cache config', async () => {
      const mockConfig = {
        analysis: {
          model: 'test-model',
          temperature: 0.5,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        },
        summary: {
          model: 'test-model',
          temperature: 0.3,
          max_tokens: 300,
          response_format: { type: 'text' },
        },
      };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      const config1 = await promptManager.getModelConfig('analysis');
      const config2 = await promptManager.getModelConfig('analysis');

      expect(config1).toEqual(mockConfig.analysis);
      expect(config2).toEqual(mockConfig.analysis);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should throw error for invalid config', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('invalid json');

      await expect(promptManager.getModelConfig('analysis')).rejects.toThrow();
    });
  });

  describe('clearCache', () => {
    it('should clear both prompt and config cache', async () => {
      const mockPrompt = 'test prompt';
      const mockConfig = {
        analysis: {
          model: 'test-model',
          temperature: 0.5,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        },
      };

      (fs.readFile as jest.Mock)
        .mockResolvedValueOnce(mockPrompt)
        .mockResolvedValueOnce(JSON.stringify(mockConfig));

      await promptManager.getPrompt('system');
      await promptManager.getModelConfig('analysis');

      promptManager.clearCache();

      await promptManager.getPrompt('system');
      await promptManager.getModelConfig('analysis');

      expect(fs.readFile).toHaveBeenCalledTimes(4);
    });
  });
});
