import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const dataFile = path.join(__dirname, '..', '..', 'datas', 'tags.json');
const username = process.env.GITHUB_USERNAME || 'User';
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

// Generate TypeScript file with embedded data
const output = `// Auto-generated at build time
export const STARSBOARD_DATA = ${JSON.stringify(data, null, 2)};
export const STARSBOARD_USERNAME = "${username}";
`;

fs.writeFileSync(outputFile, output, 'utf-8');
console.log(`✅ Generated ${outputFile}`);
