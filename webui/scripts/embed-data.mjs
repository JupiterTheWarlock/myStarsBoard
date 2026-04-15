import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (Vite prebuild scripts don't auto-load it)
const envFile = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      // Strip inline # comments (but not # inside quotes)
      const commentIdx = val.indexOf(' #');
      if (commentIdx >= 0) val = val.slice(0, commentIdx).trim();
      // Remove surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

// Paths
const dataFile = path.join(__dirname, '..', '..', 'datas', 'tags.json');
const username = process.env.GITHUB_USERNAME || 'User';
const title = process.env.STARSBOARD_TITLE || `${username}/stars`;
const favicon = process.env.STARSBOARD_FAVICON || '';
const outputFile = path.join(__dirname, '..', 'src', 'data.ts');

// Read data
let data = {};
try {
  const content = fs.readFileSync(dataFile, 'utf-8');
  data = JSON.parse(content);
  console.log(`✅ Loaded ${Object.keys(data).length} tags from tags.json`);
} catch (error) {
  console.warn('⚠️  No tags.json found, using empty data');
}

// Generate favicon data URI if it's an emoji/char, otherwise use as-is
function resolveFavicon(raw) {
  if (!raw) return '';
  // Already a data URI or URL
  if (raw.startsWith('data:') || raw.startsWith('http') || raw.startsWith('/')) return raw;
  // Treat as a character/emoji → wrap in SVG data URI
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23d97706'>${raw}</text></svg>`;
}

const faviconUri = resolveFavicon(favicon);
const iconUrl = process.env.STARSBOARD_ICON_URL || '';

// Generate TypeScript file with embedded data
const output = `// Auto-generated at build time
export const STARSBOARD_DATA = ${JSON.stringify(data, null, 2)};
export const STARSBOARD_USERNAME = "${username}";
export const STARSBOARD_TITLE = "${title.replace(/"/g, '\\"')}";
export const STARSBOARD_FAVICON = "${faviconUri}";
export const STARSBOARD_ICON = "${favicon.replace(/"/g, '\\"')}";
export const STARSBOARD_ICON_URL = "${iconUrl.replace(/"/g, '\\"')}";
`;

fs.writeFileSync(outputFile, output, 'utf-8');
console.log(`✅ Generated ${outputFile}`);
