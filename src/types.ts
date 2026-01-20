/**
 * Represents a GitHub repository that has been starred
 */
export interface Star {
  /** Unique repository ID */
  id: number;
  /** Repository name */
  name: string;
  /** Full repository name (owner/repo) */
  fullName: string;
  /** Repository description */
  description: string;
  /** Primary programming language */
  language: string;
  /** Repository URL */
  url: string;
  /** Number of stars the repository has */
  stars: number;
  /** Last update timestamp */
  updatedAt: string;
  /** AI-generated tags */
  tags?: string[];
}

/**
 * Represents a group of stars organized by tag
 */
export type StarsByTag = Record<string, Star[]>;

/**
 * Tag configuration loaded from tags.txt
 */
export interface TagConfig {
  tags: string[];
}

/**
 * Tag keywords mapping for pre-matching
 */
export interface TagKeywords {
  [tag: string]: string[];
}

/**
 * Application configuration from environment variables
 */
export interface Config {
  /** GitHub personal access token */
  githubToken: string;
  /** GitHub username */
  githubUsername: string;
  /** OpenAI API key */
  openaiApiKey: string;
  /** OpenAI base URL (for compatible APIs) */
  openaiBaseUrl: string;
  /** AI model to use */
  aiModel: string;
  /** Minimum number of tags per repository */
  tagCountMin: number;
  /** Maximum number of tags per repository */
  tagCountMax: number;
  /** Whether to allow creating new tags */
  enableNewTags: boolean;
  /** Enable thinking mode for AI */
  enableThinking: boolean;
  /** Batch size for AI processing */
  batchSize: number;
}

/**
 * Stars data cache file
 */
export interface StarsCache {
  stars: Star[];
  lastUpdated: string;
}
