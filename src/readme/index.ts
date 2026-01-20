import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { StarsByTag } from '../types.js';
import { loadTagsTxt } from '../keyword/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const README_FILE = path.join(__dirname, '..', '..', 'README.md');

/**
 * Generates markdown content from grouped stars
 * @param groupedStars - Stars grouped by tag
 * @param username - GitHub username
 * @returns Markdown string
 */
export async function generateMarkdown(groupedStars: StarsByTag, username: string): Promise<string> {
  const updatedAt = new Date().toISOString().split('T')[0];

  // Load tags from tags.txt to preserve order
  const tagOrder = await loadTagsTxt();
  const tagOrderSet = new Set(tagOrder);

  // Count total stars and tags
  const totalStars = Object.values(groupedStars).reduce((sum, repos) => sum + repos.length, 0);
  const tagCount = Object.keys(groupedStars).length;

  let markdown = `# ⭐ ${username}'s GitHub Stars

*Last updated: ${updatedAt}*  |  **Stats:** ${totalStars} stars | ${tagCount} tags

`;

  // Sort tags by tags.txt order, then alphabetically for new tags
  const tags = Object.keys(groupedStars).sort((a, b) => {
    const aIndex = tagOrderSet.has(a) ? tagOrder.indexOf(a) : Infinity;
    const bIndex = tagOrderSet.has(b) ? tagOrder.indexOf(b) : Infinity;
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    return a.localeCompare(b);
  });

  for (const tag of tags) {
    const repos = groupedStars[tag];

    // Skip empty sections
    if (repos.length === 0) {
      continue;
    }

    markdown += `## ${tag}\n\n`;

    // Sort repos by star count (descending)
    const sortedRepos = [...repos].sort((a, b) => b.stars - a.stars);

    for (const repo of sortedRepos) {
      markdown += `- [${repo.name}](${repo.url})`;
      if (repo.description) {
        markdown += ` - ${repo.description}`;
      }
      if (repo.language) {
        markdown += ` \`${repo.language}\``;
      }
      markdown += '\n';
    }

    markdown += '\n';
  }

  return markdown;
}

/**
 * Saves markdown content to README.md
 * @param markdown - Markdown content to save
 */
export async function saveReadme(markdown: string): Promise<void> {
  await fs.writeFile(README_FILE, markdown, 'utf-8');
}
