import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Star, StarsByTag } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TAGS_FILE = path.join(__dirname, '..', 'datas', 'tags.json');
const STARS_FILE = path.join(__dirname, '..', 'datas', 'stars.json');
const DATA_DIR = path.join(__dirname, '..', 'datas');

/**
 * Ensures the data directory exists
 */
async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/**
 * Loads tags from the tags.json file
 * @returns Parsed tags object or empty object if file doesn't exist
 */
export async function loadTags(): Promise<StarsByTag> {
  try {
    const data = await fs.readFile(TAGS_FILE, 'utf-8');
    return JSON.parse(data) as StarsByTag;
  } catch {
    return {};
  }
}

/**
 * Saves tags to the tags.json file
 * @param tags - Tags object to save
 */
export async function saveTags(tags: StarsByTag): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(TAGS_FILE, JSON.stringify(tags, null, 2), 'utf-8');
}

/**
 * Loads stars from the stars.json file
 * @returns Array of stars or empty array if file doesn't exist
 */
export async function loadStars(): Promise<Star[]> {
  try {
    const data = await fs.readFile(STARS_FILE, 'utf-8');
    return JSON.parse(data) as Star[];
  } catch {
    return [];
  }
}

/**
 * Saves stars to the stars.json file
 * @param stars - Array of stars to save
 */
export async function saveStars(stars: Star[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(STARS_FILE, JSON.stringify(stars, null, 2), 'utf-8');
}

/**
 * Groups stars by their tags
 * @param stars - Array of stars with tags
 * @returns Object mapping tag names to arrays of stars
 */
export function groupStarsByTag(stars: Star[]): StarsByTag {
  const grouped: StarsByTag = {};

  for (const repo of stars) {
    if (repo.tags && repo.tags.length > 0) {
      for (const tag of repo.tags) {
        if (!grouped[tag]) {
          grouped[tag] = [];
        }
        grouped[tag].push(repo);
      }
    }
  }

  return grouped;
}

/**
 * Saves grouped stars to tags.json
 * @param grouped - Grouped stars to save
 */
export async function saveTagsGrouped(grouped: StarsByTag): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(TAGS_FILE, JSON.stringify(grouped, null, 2), 'utf-8');
}
