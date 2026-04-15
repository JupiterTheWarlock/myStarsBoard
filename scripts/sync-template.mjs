#!/usr/bin/env node
/**
 * sync-template.mjs
 *
 * Syncs framework/functional files from myStarsBoard to the StarsBoard template repo.
 * Designed to run inside GitHub Actions (where template-sync/ is checked out alongside).
 *
 * Usage:
 *   node scripts/sync-template.mjs          # dry-run (preview only)
 *   node scripts/sync-template.mjs --apply  # actually copy files
 *
 * Instance-specific data files are EXCLUDED from sync.
 */

import { cpSync, rmSync, existsSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const TEMPLATE = join(ROOT, 'template-sync');

const isApply = process.argv.includes('--apply');

// --- Config ---
// Dirs to skip entirely (never synced)
const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'template-sync', '.claude', 'datas',
]);

// Top-level files to skip
const SKIP_FILES = new Set([
  '.gitmodules', '.env', '.env.local', 'README.md',
]);

// Files only relevant to the instance repo, not the template
const SKIP_DATA_FILES = new Set([
  'scripts/sync-template.mjs',               // sync tool itself
  '.github/workflows/sync-template.yml',      // sync workflow itself
]);

// Placeholder content for template data files
const PLACEHOLDERS = {
  'datas/stars.json': '[]\n',
  'datas/tags.json': '{}\n',
  'datas/stars-with-tags.json': '',
  'datas/tags.txt': '# StarsBoard Tag List\n# Add your tags below, one per line\n# Lines starting with # are comments\n',
};

// --- Helpers ---
function shouldSkip(relPath) {
  const parts = relPath.replace(/\\/g, '/').split('/');
  // Skip if any directory segment matches SKIP_DIRS
  if (parts.slice(0, -1).some(p => SKIP_DIRS.has(p))) return true;
  // Skip if top-level file matches SKIP_FILES
  if (SKIP_FILES.has(parts[0]) && parts.length === 1) return true;
  // Skip if exact relative path matches SKIP_DATA_FILES
  if (SKIP_DATA_FILES.has(parts.join('/'))) return true;
  return false;
}

function collectFiles(dir, base = '') {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = base ? `${base}/${entry}` : entry;
    if (shouldSkip(rel)) continue;
    const st = statSync(full);
    if (st.isDirectory()) {
      results.push(...collectFiles(full, rel));
    } else {
      results.push(rel);
    }
  }
  return results;
}

// --- Main ---
function main() {
  if (!existsSync(TEMPLATE)) {
    console.error('Error: template-sync/ directory not found.');
    console.error('In CI: ensure the StarsBoard repo is checked out to template-sync/.');
    console.error('Locally: run  git clone https://github.com/JupiterTheWarlock/StarsBoard.git template-sync');
    process.exit(1);
  }

  const sourceFiles = collectFiles(ROOT);
  const templateFiles = collectFiles(TEMPLATE);
  const sourceSet = new Set(sourceFiles);

  // Files in template that no longer exist in source
  const toDelete = templateFiles.filter(f => !sourceSet.has(f));

  // Instance data files that should be removed from template
  const dataToRemove = [...SKIP_DATA_FILES].filter(f => existsSync(join(TEMPLATE, f)));

  // Files to purge from template (skipped from sync but may exist from old syncs)
  const toPurge = [];
  for (const f of SKIP_FILES) {
    if (existsSync(join(TEMPLATE, f))) toPurge.push(f);
  }
  // Clean stale files in datas/ that are not in PLACEHOLDERS
  const datasDir = join(TEMPLATE, 'datas');
  if (existsSync(datasDir)) {
    const placeholderNames = new Set(Object.keys(PLACEHOLDERS).map(p => p.split('/').pop()));
    for (const entry of readdirSync(datasDir)) {
      const rel = `datas/${entry}`;
      if (!placeholderNames.has(entry)) toPurge.push(rel);
    }
  }

  if (!isApply) {
    console.log('=== DRY RUN ===\n');
    console.log(`Would copy ${sourceFiles.length} files from myStarsBoard -> template-sync/`);
    for (const f of sourceFiles.slice(0, 20)) console.log(`  + ${f}`);
    if (sourceFiles.length > 20) console.log(`  ... and ${sourceFiles.length - 20} more`);

    if (toDelete.length) {
      console.log(`\nWould delete ${toDelete.length} files from template-sync/ (not in source):`);
      for (const f of toDelete) console.log(`  - ${f}`);
    }
    if (dataToRemove.length) {
      console.log(`\nWould remove instance data files from template:`);
      for (const f of dataToRemove) console.log(`  x ${f}`);
    }
    if (toPurge.length) {
      console.log(`\nWould purge from template (skipped files / stale data):`);
      for (const f of toPurge) console.log(`  ~ ${f}`);
    }
    console.log('\nUse --apply to execute.');
    return;
  }

  // Apply mode
  console.log('=== SYNCING: myStarsBoard -> StarsBoard template ===\n');

  for (const f of sourceFiles) {
    cpSync(join(ROOT, f), join(TEMPLATE, f), { force: true });
  }
  console.log(`Copied ${sourceFiles.length} files.`);

  for (const f of toDelete) {
    rmSync(join(TEMPLATE, f), { force: true });
  }
  console.log(`Deleted ${toDelete.length} stale files.`);

  for (const f of dataToRemove) {
    rmSync(join(TEMPLATE, f), { force: true });
  }
  if (dataToRemove.length) console.log(`Removed ${dataToRemove.length} instance data files.`);

  for (const f of toPurge) {
    rmSync(join(TEMPLATE, f), { force: true });
  }
  if (toPurge.length) console.log(`Purged ${toPurge.length} skipped/stale files (README.md, extra data).`);

  // Ensure placeholder data files exist in template
  mkdirSync(join(TEMPLATE, 'datas'), { recursive: true });
  for (const [file, content] of Object.entries(PLACEHOLDERS)) {
    writeFileSync(join(TEMPLATE, file), content);
  }
  console.log('Ensured placeholder data files in template.');
}

main();
