import fs from 'fs/promises';
import path from 'path';
import type { Star, TagKeywords } from '../types.js';
import { DATA_DIR } from '../paths.js';

const TAGS_TXT_FILE = path.join(DATA_DIR, 'tags.txt');
const TAG_KEYWORDS_FILE = path.join(DATA_DIR, 'tag-keywords.json');

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
    return ['前端', '后端', 'Unity', '游戏开发', '独立游戏', '信息收集', 'AI Agent', 'AI工具', '开发工具', '未分类'];
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
      前端: ['react', 'vue', 'angular', 'svelte', 'ui', 'component', 'javascript', 'typescript', 'css', 'html'],
      后端: ['server', 'api', 'backend', 'database', 'graphql', 'rest', 'fastapi', 'express'],
      Unity: ['unity', 'unity3d', 'c#', 'shadergraph', 'assetbundle'],
      游戏开发: ['game', 'gamedev', 'godot', 'unreal', 'shader', 'graphics', '3d'],
      独立游戏: ['indie game', 'indiegame', 'itch.io', 'steam'],
      信息收集: ['rss', 'crawler', 'scraper', 'bookmark', 'archive', 'collector', 'news'],
      'AI Agent': ['agent', 'mcp', 'claude', 'autonomous', 'multi-agent', 'workflow'],
      AI工具: ['llm', 'gpt', 'openai', 'embedding', 'machine learning', 'ai', 'rag'],
      开发工具: ['cli', 'tool', 'developer', 'debug', 'automation', 'script'],
    };
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function keywordMatches(searchText: string, keyword: string): boolean {
  const normalized = keyword.toLowerCase().trim();
  if (normalized.length === 0) {
    return false;
  }

  if (/^[a-z0-9][a-z0-9+#.\s-]*$/i.test(normalized)) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalized)}([^a-z0-9]|$)`, 'i');
    return pattern.test(searchText);
  }

  return searchText.includes(normalized);
}

/**
 * Finds the best matching tag based on keywords
 * @param repo - Repository to analyze
 * @param tagKeywords - Tag keywords mapping
 * @returns Matched tag name or null
 */
export function matchTagByKeywords(repo: Star, tagKeywords: TagKeywords): string | null {
  const matches = matchTagsByKeywords(repo, tagKeywords, 1);
  return matches[0] ?? null;
}

/**
 * Finds matching tags based on keyword scores.
 * @param repo - Repository to analyze
 * @param tagKeywords - Tag keywords mapping
 * @param maxTags - Maximum number of tags to return
 * @returns Matched tags ordered by score
 */
export function matchTagsByKeywords(repo: Star, tagKeywords: TagKeywords, maxTags: number): string[] {
  const searchText = `${repo.name} ${repo.description} ${repo.language}`.toLowerCase();

  // Score each tag by keyword matches
  const scores: Record<string, number> = {};

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (keywordMatches(searchText, keyword)) {
        score += 1;
      }
    }
    if (score > 0) {
      scores[tag] = score;
    }
  }

  // Return tag with highest score
  if (Object.keys(scores).length === 0) {
    return [];
  }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxTags)
    .map(([tag]) => tag);
}
