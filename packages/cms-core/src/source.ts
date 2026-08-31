import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { readCatalog, siteById, type CatalogSite } from './catalog.ts';
import { readPinFile, type Pin } from './pin.ts';
import { glob } from 'node:fs/promises';
import { statSync } from 'node:fs';

export type SourceMode = 'pin' | 'fixture';

export interface ResolvedSource {
  site: CatalogSite;
  pin: Pin;
  mode: SourceMode;
  root: string;
  blobRef: string;
  treeFiles: string[];
}

export function repoRootFrom(metaUrl: string, up: number): string {
  let dir = dirname(fileURLToPath(metaUrl));
  for (let i = 0; i < up; i++) dir = dirname(dir);
  return dir;
}

export function isProductionPublish(): boolean {
  return (
    process.env.CMS_PRODUCTION === '1' ||
    process.env.CONTEXT === 'production' ||
    process.env.NETLIFY_CONTEXT === 'production'
  );
}

export async function listTreeFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  for await (const rel of glob('**/*', { cwd: root })) {
    const full = join(root, rel);
    if (statSync(full).isFile()) {
      files.push(rel.replace(/\\/g, '/'));
    }
  }
  return files.sort();
}

function archiveUrl(repo: string, pin: Pin): string {
  if (pin.kind === 'tag') {
    return `https://github.com/${repo}/archive/refs/tags/${pin.value}.tar.gz`;
  }
  if (pin.kind === 'sha') {
    return `https://github.com/${repo}/archive/${pin.value}.tar.gz`;
  }
  throw new Error('cannot fetch archive for unset pin');
}

async function fetchPinCheckout(repo: string, pin: Pin, cacheDir: string): Promise<string> {
  const key = pin.kind === 'unset' ? 'unset' : pin.value;
  const dest = join(cacheDir, key);
  if (existsSync(join(dest, '.cms-ok'))) {
    return dest;
  }
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  const url = archiveUrl(repo, pin);
  const res = await fetch(url, { headers: { 'User-Agent': 'MajestaNet-cms' } });
  if (!res.ok) {
    throw new Error(`failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const tmp = await mkdtemp(join(tmpdir(), 'cms-src-'));
  const tgz = join(tmp, 'src.tar.gz');
  writeFileSync(tgz, buf);
  execFileSync('tar', ['-xzf', tgz, '-C', tmp]);
  // GitHub archives contain a single top-level directory.
  const entries = execFileSync('ls', [tmp], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter((n) => n !== 'src.tar.gz');
  if (entries.length !== 1) {
    throw new Error(`unexpected archive layout from ${url}`);
  }
  execFileSync('cp', ['-a', `${join(tmp, entries[0])}/.`, dest]);
  rmSync(tmp, { recursive: true, force: true });
  writeFileSync(join(dest, '.cms-ok'), `${repo}@${key}\n`);
  return dest;
}

export interface ResolveOptions {
  repoRoot: string;
  siteId: string;
}

export async function resolveSource(opts: ResolveOptions): Promise<ResolvedSource> {
  const catalog = readCatalog(join(opts.repoRoot, 'sites/catalog.yaml'));
  const site = siteById(catalog, opts.siteId);
  if (!site) throw new Error(`unknown site id ${opts.siteId}`);
  const pin = readPinFile(join(opts.repoRoot, site.pin_file));
  const production = isProductionPublish();

  if (pin.kind === 'unset' && production) {
    throw new Error(
      `sites/${site.id}/pin is unset; refusing production publish (will not fetch ${site.source_repo} main)`,
    );
  }

  if (pin.kind === 'tag' || pin.kind === 'sha') {
    const cacheDir = join(opts.repoRoot, '.cache/source', site.id);
    mkdirSync(cacheDir, { recursive: true });
    const root = await fetchPinCheckout(site.source_repo, pin, cacheDir);
    const treeFiles = await listTreeFiles(root);
    return {
      site,
      pin,
      mode: 'pin',
      root,
      blobRef: pin.value,
      treeFiles,
    };
  }

  const envDir = process.env.CMS_SOURCE_DIR;
  const fixtureDir = join(opts.repoRoot, 'fixtures', site.id);
  const root = envDir && existsSync(envDir) ? envDir : fixtureDir;
  if (!existsSync(root)) {
    throw new Error(
      `pin is unset and no fixture source at ${root}; set CMS_SOURCE_DIR or add fixtures/${site.id}/`,
    );
  }
  const treeFiles = await listTreeFiles(root);
  return {
    site,
    pin,
    mode: 'fixture',
    root,
    blobRef: 'HEAD',
    treeFiles,
  };
}

export function readGeneratedNote(root: string): string {
  try {
    return readFileSync(join(root, '.cms-ok'), 'utf8');
  } catch {
    return '';
  }
}
