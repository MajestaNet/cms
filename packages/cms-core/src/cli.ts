#!/usr/bin/env npx tsx
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkAllSites } from './check.ts';

function findRepoRoot(): string {
  if (process.env.CMS_REPO_ROOT) return resolve(process.env.CMS_REPO_ROOT);
  const starts = [process.cwd(), dirname(fileURLToPath(import.meta.url))];
  for (const start of starts) {
    let dir = start;
    for (let i = 0; i < 8; i++) {
      if (existsSync(join(dir, 'sites/catalog.yaml'))) return dir;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  throw new Error('could not find sites/catalog.yaml; set CMS_REPO_ROOT');
}
const cmd = process.argv[2] ?? 'check';
const repoRoot = findRepoRoot();

if (cmd !== 'check') {
  console.error(`unknown command ${cmd}`);
  process.exit(2);
}

try {
  const results = await checkAllSites(repoRoot);
  for (const r of results) {
    const pageCount = Object.keys(r.pages).length;
    const fileCount = new Set(Object.values(r.pages).flat()).size;
    console.log(
      `site ${r.id}: pin=${r.pin} mode=${r.mode} pages=${pageCount} source-files=${fileCount}`,
    );
    for (const [route, files] of Object.entries(r.pages)) {
      console.log(`  ${route}: ${files.join(', ')}`);
    }
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
