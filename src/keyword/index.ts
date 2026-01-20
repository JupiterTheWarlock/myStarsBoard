import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Star, TagKeywords } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TAGS_TXT_FILE = path.join(__dirname, '..', 'datas', 'tags.txt');
const TAG_KEYWORDS_FILE = path.join(__dirname, '..', 'datas', 'tag-keywords.json');
const DATA_DIR = path.join(__dirname, '..', 'datas');

/**
 * Loads tags from tags.txt file
 * @returns Array of tag names in order
 */
export async function loadTagsTxt(): Promise<string[]> {
  try {
    const content = await fs.readFile(TAGS_TXT_FILE, 'utf-8');
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));
  } catch {
    // Return default tags if file doesn't exist
    return ['frontend', 'backend', 'ai', 'tool', 'library', 'tutorial', 'util', 'Uncategorized'];
  }
}

/**
 * Appends a new tag to tags.txt
 * @param tag - Tag name to append
 */
export async function appendTagToTagsTxt(tag: string): Promise<void> {
  // Filter special characters
  const cleanTag = tag.replace(/[#\/\\]/g, '').trim();
  if (cleanTag.length === 0) {
    return;
  }

  const existingTags = await loadTagsTxt();
  if (existingTags.includes(cleanTag)) {
    return; // Tag already exists
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(TAGS_TXT_FILE, `\n${cleanTag}`, 'utf-8');
}

/**
 * Loads tag-keywords.json for keyword matching
 * @returns Tag keywords mapping
 */
export async function loadTagKeywords(): Promise<TagKeywords> {
  try {
    const content = await fs.readFile(TAG_KEYWORDS_FILE, 'utf-8');
    return JSON.parse(content) as TagKeywords;
  } catch {
    // Return default keywords if file doesn't exist
    return {
      frontend: ['react', 'vue', 'angular', 'svelte', 'ui', 'component', 'javascript', 'typescript', 'css', 'html'],
      backend: ['express', 'fastify', 'nest', 'koa', 'server', 'api', 'rest', 'graphql', 'microservice'],
      ai: ['machine learning', 'deep learning', 'neural', 'tensorflow', 'pytorch', 'llm', 'gpt', 'openai'],
      tool: ['cli', 'utility', 'helper', 'tool', 'script', 'automation'],
      library: ['lib', 'framework', 'sdk', 'package'],
      tutorial: ['tutorial', 'guide', 'learn', 'course', 'example', 'demo'],
      util: ['util', 'helper', 'common', 'shared'],
    };
  }
}

/**
 * Finds the best matching tag based on keywords
 * @param repo - Repository to analyze
 * @param tagKeywords - Tag keywords mapping
 * @returns Matched tag name or null
 */
export function matchTagByKeywords(repo: Star, tagKeywords: TagKeywords): string | null {
  const searchText = `${repo.name} ${repo.description} ${repo.language}`.toLowerCase();

  // Score each tag by keyword matches
  const scores: Record<string, number> = {};

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    if (score > 0) {
      scores[tag] = score;
    }
  }

  // Return tag with highest score
  if (Object.keys(scores).length === 0) {
    return null;
  }

  const bestTag = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return bestTag;
}
