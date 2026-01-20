import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig } from '../src/config/index.js';

describe('config module', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear all env vars and reset to clean state
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('should load config with default values', () => {
      process.env.GITHUB_TOKEN = 'test-token';
      process.env.GITHUB_USERNAME = 'testuser';
      process.env.OPENAI_API_KEY = 'test-api-key';

      const config = loadConfig();

      expect(config.githubToken).toBe('test-token');
      expect(config.githubUsername).toBe('testuser');
      expect(config.openaiApiKey).toBe('test-api-key');
      expect(config.openaiBaseUrl).toBe('https://api.openai.com/v1');
      expect(config.aiModel).toBe('gpt-4o');
      expect(config.tagCountMin).toBe(3);
      expect(config.tagCountMax).toBe(5);
      expect(config.enableNewTags).toBe(true);
      expect(config.enableThinking).toBe(false);
      expect(config.batchSize).toBe(5);
    });

    it('should use custom values from environment', () => {
      process.env.GITHUB_TOKEN = 'custom-token';
      process.env.GITHUB_USERNAME = 'customuser';
      process.env.OPENAI_API_KEY = 'custom-api-key';
      process.env.OPENAI_BASE_URL = 'https://custom.ai/v1';
      process.env.AI_MODEL = 'gpt-3.5-turbo';
      process.env.TAG_COUNT_MIN = '1';
      process.env.TAG_COUNT_MAX = '10';
      process.env.ENABLE_NEW_TAGS = 'false';
      process.env.ENABLE_THINKING = 'true';
      process.env.BATCH_SIZE = '10';

      const config = loadConfig();

      expect(config.githubToken).toBe('custom-token');
      expect(config.githubUsername).toBe('customuser');
      expect(config.openaiBaseUrl).toBe('https://custom.ai/v1');
      expect(config.aiModel).toBe('gpt-3.5-turbo');
      expect(config.tagCountMin).toBe(1);
      expect(config.tagCountMax).toBe(10);
      expect(config.enableNewTags).toBe(false);
      expect(config.enableThinking).toBe(true);
      expect(config.batchSize).toBe(10);
    });

    it('should throw error when GITHUB_TOKEN is missing', () => {
      process.env.GITHUB_USERNAME = 'testuser';
      process.env.OPENAI_API_KEY = 'test-api-key';
      delete process.env.GITHUB_TOKEN;

      expect(() => loadConfig()).toThrow('GITHUB_TOKEN environment variable is required');
    });

    it('should throw error when GITHUB_USERNAME is missing', () => {
      process.env.GITHUB_TOKEN = 'test-token';
      process.env.OPENAI_API_KEY = 'test-api-key';
      delete process.env.GITHUB_USERNAME;

      expect(() => loadConfig()).toThrow('GITHUB_USERNAME environment variable is required');
    });

    it('should throw error when OPENAI_API_KEY is missing', () => {
      process.env.GITHUB_TOKEN = 'test-token';
      process.env.GITHUB_USERNAME = 'testuser';
      delete process.env.OPENAI_API_KEY;

      expect(() => loadConfig()).toThrow('OPENAI_API_KEY environment variable is required');
    });
  });
});
