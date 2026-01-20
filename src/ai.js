import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const client = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY
});

const { AI_MODEL = 'gpt-4o' } = process.env;
const ENABLE_THINKING = process.env.ENABLE_THINKING === 'true';
const LANGUAGE = process.env.LANGUAGE || 'en';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'datas');
const STARS_WITH_TAGS_FILE = path.join(DATA_DIR, 'stars-with-tags.json');

export async function generateTags(repo) {

  const prompt = `Generate 3-5 tags (in ${LANGUAGE}, comma-separated) based on the following repository information:
Repository: ${repo.fullName}
Description: ${repo.description}
Language: ${repo.language}

Return only tag names in ${LANGUAGE}, comma-separated, no other content. Example: frontend,tool,library`;

  try {
    const requestOptions = {
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional code repository tag generator. Generate concise and accurate tags based on repository information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 100
    };

    if (!ENABLE_THINKING) {
      requestOptions.extra_body = {
        chat_template_kwargs: { enable_thinking: false }
      };
    }

    const response = await client.chat.completions.create(requestOptions);

    const message = response.choices[0]?.message || {};
    
    let content = '';
    
    if (message.reasoning_content && message.reasoning_content.length > 0) {
      content = message.reasoning_content;
      console.log(`  [Thinking模式] ${repo.fullName}`);
    } else if (message.content && message.content.length > 0) {
      content = message.content;
      console.log(`  [普通模式] ${repo.fullName}`);
    } else {
      console.log(`  [空响应] ${repo.fullName}`);
    }

    const tags = content.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0 && !tag.includes('**') && !tag.includes('1.'));
    return tags;
  } catch (error) {
    console.error(`Error generating tags for ${repo.fullName}:`, error.message);
    return [];
  }
}

export async function loadStarsWithTags() {
  try {
    const data = await fs.readFile(STARS_WITH_TAGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function saveStarsWithTags(stars) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STARS_WITH_TAGS_FILE, JSON.stringify(stars, null, 2), 'utf-8');
}

export async function generateTagsBatch(repos, batchSize = 5) {
  const processed = await loadStarsWithTags();
  const processedIds = new Set(processed.map(r => r.id));

  const unprocessed = repos.filter(r => !processedIds.has(r.id));
  const totalToProcess = unprocessed.length;
  
  console.log(`✅ 已处理 ${processed.length} 个仓库`);
  console.log(`📝 待处理 ${totalToProcess} 个仓库`);

  if (totalToProcess === 0) {
    console.log('所有仓库已处理完成！');
    return processed;
  }

  const results = [...processed];

  for (let i = 0; i < totalToProcess; i += batchSize) {
    const batch = unprocessed.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(totalToProcess / batchSize);
    
    console.log(`Processing batch ${batchNum}/${totalBatches}...`);

    const batchResults = await Promise.all(
      batch.map(async (repo) => {
        const tags = await generateTags(repo);
        console.log(`  - ${repo.fullName}: ${tags.length > 0 ? tags.join(', ') : '❌ 失败'}`);
        return { ...repo, tags };
      })
    );

    results.push(...batchResults);
    
    await saveStarsWithTags(results);
    console.log(`✅ 已处理 ${results.length}/${repos.length} 个仓库`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}
