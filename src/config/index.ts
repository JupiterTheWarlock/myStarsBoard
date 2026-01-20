import dotenv from 'dotenv';
import type { Config } from '../types.js';

dotenv.config();

/**
 * Loads and validates configuration from environment variables
 */
export function loadConfig(): Config {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubUsername = process.env.GITHUB_USERNAME;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!githubToken) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }
  if (!githubUsername) {
    throw new Error('GITHUB_USERNAME environment variable is required');
  }
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  return {
    githubToken,
    githubUsername,
    openaiApiKey,
    openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    aiModel: process.env.AI_MODEL || 'gpt-4o',
    tagCountMin: parseInt(process.env.TAG_COUNT_MIN || '3', 10),
    tagCountMax: parseInt(process.env.TAG_COUNT_MAX || '5', 10),
    enableNewTags: process.env.ENABLE_NEW_TAGS !== 'false',
    enableThinking: process.env.ENABLE_THINKING === 'true',
    batchSize: parseInt(process.env.BATCH_SIZE || '5', 10),
  };
}

/**
 * Global config instance
 */
export const config = loadConfig();
