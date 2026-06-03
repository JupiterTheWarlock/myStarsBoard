#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'datas');
const starsWithTagsFile = path.join(dataDir, 'stars-with-tags.json');
const starsFile = path.join(dataDir, 'stars.json');
const tagsFile = path.join(dataDir, 'tags.json');
const tagsTxtFile = path.join(dataDir, 'tags.txt');
const tagKeywordsFile = path.join(dataDir, 'tag-keywords.json');
const embeddingsFile = path.join(dataDir, 'embeddings.json');

function normalizeText(repo) {
  return [
    repo.name,
    repo.fullName,
    repo.description || '',
    repo.language || '',
  ].join(' ').toLowerCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function keywordMatches(text, keyword) {
  const normalized = String(keyword).toLowerCase().trim();
  if (!normalized) {
    return false;
  }

  if (/^[a-z0-9][a-z0-9+#.\s-]*$/i.test(normalized)) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalized)}([^a-z0-9]|$)`, 'i').test(text);
  }

  return text.includes(normalized);
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function readTags() {
  const content = await fs.readFile(tagsTxtFile, 'utf8');
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

function assignTags(repo, tagOrder, keywordMap, maxTags = 5) {
  const text = normalizeText(repo);
  const scores = new Map();

  for (const tag of tagOrder) {
    const keywords = keywordMap[tag] || [];
    let score = 0;
    for (const keyword of keywords) {
      if (keywordMatches(text, keyword)) {
        score += 1;
      }
    }
    if (score > 0) {
      scores.set(tag, score);
    }
  }

  const tags = [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || tagOrder.indexOf(a[0]) - tagOrder.indexOf(b[0]))
    .slice(0, maxTags)
    .map(([tag]) => tag);

  return tags.length > 0 ? tags : ['未分类'];
}

function groupByTag(stars) {
  const grouped = {};
  for (const repo of stars) {
    for (const tag of repo.tags || []) {
      grouped[tag] ||= [];
      grouped[tag].push(repo);
    }
  }
  return grouped;
}

async function main() {
  const tagOrder = await readTags();
  const keywordMap = await readJson(tagKeywordsFile, {});
  const source = await readJson(starsWithTagsFile, null) || await readJson(starsFile, []);

  if (!Array.isArray(source) || source.length === 0) {
    throw new Error('No stars found in datas/stars-with-tags.json or datas/stars.json');
  }

  const retagged = source.map((repo) => ({
    ...repo,
    tags: assignTags(repo, tagOrder, keywordMap),
  }));

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(starsWithTagsFile, JSON.stringify(retagged, null, 2), 'utf8');
  await fs.writeFile(tagsFile, JSON.stringify(groupByTag(retagged), null, 2), 'utf8');

  try {
    await fs.writeFile(embeddingsFile, '{}\n', 'utf8');
    console.log('Cleared datas/embeddings.json because tag text changed.');
  } catch {
    // Embeddings are optional.
  }

  const counts = new Map();
  for (const repo of retagged) {
    for (const tag of repo.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  console.log(`Retagged ${retagged.length} repositories.`);
  for (const tag of tagOrder) {
    console.log(`${tag}: ${counts.get(tag) || 0}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
