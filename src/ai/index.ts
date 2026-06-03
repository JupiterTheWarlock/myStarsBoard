import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/index.js';
import { withApiRetry } from '../utils/retry.js';
import { loadTagsTxt, appendTagToTagsTxt, matchTagByKeywords, matchTagsByKeywords, loadTagKeywords } from '../keyword/index.js';
import type { Star } from '../types.js';
import { DATA_DIR } from '../paths.js';
import { parseGeneratedTags } from './tag-parser.js';

const STARS_WITH_TAGS_FILE = path.join(DATA_DIR, 'stars-with-tags.json');

const client = new OpenAI({
  baseURL: config.openaiBaseUrl,
  apiKey: config.openaiApiKey,
});

/**
 * Generates tags for a single repository using AI with keyword pre-matching
 * @param repo - Repository to generate tags for
 * @param existingTags - List of existing tags from tags.txt
 * @returns Array of generated tags
 */
export async function generateTags(repo: Star, existingTags: string[]): Promise<string[]> {
  // Keyword pre-matching
  const tagKeywords = await loadTagKeywords();
  if (!config.enableAiTagging) {
    const manualTags = matchTagsByKeywords(repo, tagKeywords, config.tagCountMax)
      .filter((tag) => existingTags.includes(tag));
    return manualTags.length > 0 ? manualTags : ['未分类'];
  }

  const suggestedTag = matchTagByKeywords(repo, tagKeywords);

  // Build AI prompt with existing tags and suggestion
  const existingTagsList = existingTags.join(', ');
  const suggestion = suggestedTag ? `建议标签: ${suggestedTag}` : '无建议标签';

  const prompt = `根据以下仓库信息生成${config.tagCountMin}-${config.tagCountMax}个标签（用逗号分隔）：

现有标签列表: ${existingTagsList}
${suggestion}

仓库信息:
- 仓库名: ${repo.fullName}
- 描述: ${repo.description}
- 语言: ${repo.language}

要求:
1. 优先使用现有标签列表中的标签
2. 只返回标签名称，用逗号分隔
3. ${config.enableNewTags ? '如果没有合适的现有标签，可以创建新标签' : '不要创建新标签，使用 未分类'}

示例: frontend,tool,library`;

  try {
    const requestOptions: Record<string, unknown> = {
      model: config.aiModel,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的代码仓库标签生成助手。根据仓库信息和现有标签列表，生成简洁准确的标签。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 150,
    };

    if (!config.enableThinking) {
      requestOptions.extra_body = {
        chat_template_kwargs: { enable_thinking: false },
      };
    }

    // Use retry logic for AI API calls
    const response = await withApiRetry(
      () => client.chat.completions.create(requestOptions as any),
      `AI tag generation for ${repo.fullName}`
    );

    const content = response.choices[0]?.message?.content?.trim() ?? '';

    if (content.length > 0) {
      console.log(`  [AI响应] ${repo.fullName}`);
    } else {
      console.log(`  [空响应] ${repo.fullName}`);
    }

    let tags = parseGeneratedTags(content, config.tagCountMax);

    // Handle new tags
    if (config.enableNewTags) {
      for (const tag of tags) {
        if (!existingTags.includes(tag) && tag !== '未分类') {
          await appendTagToTagsTxt(tag);
          existingTags.push(tag);
          console.log(`  [新标签] ${tag}`);
        }
      }
    }

    if (tags.length === 0) {
      tags = ['未分类'];
    }

    return tags;
  } catch (error) {
    console.error(`Error generating tags for ${repo.fullName}:`, (error as Error).message);
    return ['未分类'];
  }
}

/**
 * Loads stars with tags from cache
 * @returns Array of stars with tags
 */
export async function loadStarsWithTags(): Promise<Star[]> {
  try {
    const data = await fs.readFile(STARS_WITH_TAGS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as Star[];
    console.log(`📦 从缓存加载了 ${parsed.length} 个仓库 (${STARS_WITH_TAGS_FILE})`);
    return parsed;
  } catch (err) {
    console.log(`📦 缓存文件不存在或读取失败 (${STARS_WITH_TAGS_FILE}): ${(err as Error).message}`);
    return [];
  }
}

/**
 * Saves stars with tags to cache
 * @param stars - Array of stars with tags
 */
export async function saveStarsWithTags(stars: Star[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STARS_WITH_TAGS_FILE, JSON.stringify(stars, null, 2), 'utf-8');
}

/**
 * Generates tags for multiple repositories in batches
 * Supports resuming from previous runs via cache
 * @param repos - Repositories to process
 * @param batchSize - Number of concurrent requests
 * @returns Array of stars with tags
 */
export async function generateTagsBatch(repos: Star[], batchSize?: number): Promise<Star[]> {
  const actualBatchSize = batchSize ?? config.batchSize;
  const processed = await loadStarsWithTags();
  const processedIds = new Set(processed.map((r) => r.id));

  const unprocessed = repos.filter((r) => !processedIds.has(r.id));
  const totalToProcess = unprocessed.length;

  console.log(`✅ 已处理 ${processed.length} 个仓库`);
  console.log(`📝 待处理 ${totalToProcess} 个仓库`);

  if (totalToProcess === 0) {
    console.log('所有仓库已处理完成！');
    return processed;
  }

  // Load existing tags for AI context
  const existingTags = await loadTagsTxt();
  console.log(`📋 现有标签: ${existingTags.join(', ')}`);

  const results: Star[] = [...processed];

  for (let i = 0; i < totalToProcess; i += actualBatchSize) {
    const batch = unprocessed.slice(i, i + actualBatchSize);
    const batchNum = Math.floor(i / actualBatchSize) + 1;
    const totalBatches = Math.ceil(totalToProcess / actualBatchSize);

    console.log(`Processing batch ${batchNum}/${totalBatches}...`);

    const batchResults = await Promise.all(
      batch.map(async (repo) => {
        const tags = await generateTags(repo, existingTags);
        console.log(`  - ${repo.fullName}: ${tags.join(', ')}`);
        return { ...repo, tags };
      })
    );

    results.push(...batchResults);

    await saveStarsWithTags(results);
    console.log(`✅ 已处理 ${results.length}/${repos.length} 个仓库`);

    // Rate limiting delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}
