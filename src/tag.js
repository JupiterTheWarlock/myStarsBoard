import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'datas');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');
const STARS_FILE = path.join(DATA_DIR, 'stars.json');

export async function loadTags() {
  try {
    const data = await fs.readFile(TAGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

export async function saveTags(tags) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(TAGS_FILE, JSON.stringify(tags, null, 2), 'utf-8');
}

export async function loadStars() {
  try {
    const data = await fs.readFile(STARS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function saveStars(stars) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STARS_FILE, JSON.stringify(stars, null, 2), 'utf-8');
}

export function groupStarsByTag(stars) {
  const grouped = {};

  stars.forEach(repo => {
    if (repo.tags && repo.tags.length > 0) {
      repo.tags.forEach(tag => {
        if (!grouped[tag]) {
          grouped[tag] = [];
        }
        grouped[tag].push(repo);
      });
    }
  });

  return grouped;
}

export async function saveTagsGrouped(grouped) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(TAGS_FILE, JSON.stringify(grouped, null, 2), 'utf-8');
}
