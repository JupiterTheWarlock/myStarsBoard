import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';
import type { Star } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMBEDDINGS_FILE = path.join(__dirname, '..', '..', 'datas', 'embeddings.json');
const DATA_DIR = path.join(__dirname, '..', '..', 'datas');
const EMBEDDING_MODEL = 'qwen/qwen3-embedding-8b';
const EMBEDDING_DIMENSIONS = 256;
const BATCH_SIZE = 20;

type EmbeddingMap = Record<string, number[]>;

const client = new OpenAI({
  baseURL: config.openaiBaseUrl,
  apiKey: config.openaiApiKey,
});

async function loadExisting(): Promise<EmbeddingMap> {
  try {
    const data = await fs.readFile(EMBEDDINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function save(map: EmbeddingMap): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(EMBEDDINGS_FILE, JSON.stringify(map, null, 2), 'utf-8');
}

function repoToText(repo: Star): string {
  const parts = [
    repo.fullName,
    repo.description || '',
    repo.tags?.join(', ') || '',
    repo.language || '',
  ].filter(Boolean);
  return parts.join(' | ');
}

export async function generateEmbeddings(stars: Star[]): Promise<EmbeddingMap> {
  const existing = await loadExisting();
  const toProcess = stars.filter(s => !existing[String(s.id)]);

  console.log(`📐 已有 ${Object.keys(existing).length} 个 embedding`);
  console.log(`📐 待生成 ${toProcess.length} 个 embedding`);

  if (toProcess.length === 0) {
    console.log('所有 embedding 已生成！');
    return existing;
  }

  const embeddings: EmbeddingMap = { ...existing };

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);
    const texts = batch.map(repoToText);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toProcess.length / BATCH_SIZE);

    console.log(`  Embedding batch ${batchNum}/${totalBatches}...`);

    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    for (let j = 0; j < batch.length; j++) {
      // Round to 4 decimal places to reduce file size
      embeddings[String(batch[j].id)] = response.data[j].embedding.map(
        (v: number) => Math.round(v * 10000) / 10000
      );
    }

    await save(embeddings);
    console.log(`  ✅ ${Object.keys(embeddings).length}/${stars.length} embeddings generated`);

    if (i + BATCH_SIZE < toProcess.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`✅ Embedding 生成完成: ${Object.keys(embeddings).length} 个`);
  return embeddings;
}
