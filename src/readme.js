import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const README_FILE = path.join(__dirname, '..', 'README.md');

export function generateMarkdown(groupedStars, username) {
  const updatedAt = new Date().toISOString().split('T')[0];
  let markdown = `# ⭐ 我的 GitHub Stars

*最后更新: ${updatedAt}*

`;

  const tags = Object.keys(groupedStars).sort();

  tags.forEach(tag => {
    markdown += `## ${tag}\n\n`;

    groupedStars[tag].forEach(repo => {
      markdown += `- [${repo.name}](${repo.url})`;
      if (repo.description) {
        markdown += ` - ${repo.description}`;
      }
      if (repo.language) {
        markdown += ` \`${repo.language}\``;
      }
      markdown += '\n';
    });

    markdown += '\n';
  });

  return markdown;
}

export async function saveReadme(markdown) {
  await fs.writeFile(README_FILE, markdown, 'utf-8');
}
