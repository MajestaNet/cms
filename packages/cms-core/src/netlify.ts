import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Catalog, CatalogSite } from './catalog.ts';

/** Paths that must appear in this site's Netlify ignore list. */
export function requiredIgnorePaths(site: CatalogSite): string[] {
  return [
    site.directory,
    'brand',
    'packages/cms-core',
    `fixtures/${site.id}`,
    'package.json',
    'package-lock.json',
  ];
}

/**
 * Paths after the standalone `--` in a `git diff --quiet … -- <paths>` ignore command.
 * `--quiet` is a flag; the path list starts at a lone `--` token.
 */
export function parseIgnorePaths(ignoreCommand: string): string[] {
  const tokens = ignoreCommand.trim().split(/\s+/);
  const dash = tokens.lastIndexOf('--');
  if (dash === -1 || dash === tokens.length - 1) {
    throw new Error('ignore command must list paths after --');
  }
  return tokens.slice(dash + 1);
}

export function checkSiteNetlifyToml(tomlText: string, site: CatalogSite, catalog: Catalog): void {
  const ignoreLine = tomlText.match(/^\s*ignore\s*=\s*"([^"]*)"/m);
  if (!ignoreLine) {
    throw new Error(`${site.directory}/netlify.toml must set [build].ignore`);
  }
  let paths: string[];
  try {
    paths = parseIgnorePaths(ignoreLine[1]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`${site.directory}/netlify.toml ${message}`);
  }
  const pathSet = new Set(paths);
  for (const required of requiredIgnorePaths(site)) {
    if (!pathSet.has(required)) {
      throw new Error(
        `${site.directory}/netlify.toml ignore must include ${required} (rebuild when shared or local inputs change)`,
      );
    }
  }
  for (const other of catalog.sites) {
    if (other.id === site.id) continue;
    if (pathSet.has(other.directory) || pathSet.has(`fixtures/${other.id}`)) {
      throw new Error(
        `${site.directory}/netlify.toml ignore must not include ${other.id}; a ${other.id} overlay change must not rebuild ${site.hostname}`,
      );
    }
  }
  const publish = tomlText.match(/^\s*publish\s*=\s*"([^"]*)"/m);
  const expectedPublish = `${site.directory}/dist`;
  if (!publish || publish[1] !== expectedPublish) {
    throw new Error(`${site.directory}/netlify.toml publish must be ${expectedPublish}`);
  }
}

export function checkCatalogNetlify(repoRoot: string, catalog: Catalog): void {
  const rootToml = join(repoRoot, 'netlify.toml');
  if (existsSync(rootToml)) {
    throw new Error('root netlify.toml is forbidden; each site keeps netlify.toml under sites/<id>/');
  }
  for (const site of catalog.sites) {
    const path = join(repoRoot, site.directory, 'netlify.toml');
    if (!existsSync(path)) {
      throw new Error(`${site.directory}/netlify.toml is missing`);
    }
    checkSiteNetlifyToml(readFileSync(path, 'utf8'), site, catalog);
  }
}
