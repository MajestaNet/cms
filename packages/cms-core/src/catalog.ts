import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

export type ProductionPinRule = 'tag-v' | 'main';

export interface CatalogSite {
  id: string;
  source_repo: string;
  directory: string;
  hostname: string;
  netlify_site: string;
  agent: string;
  production_pin: ProductionPinRule;
  pin_file: string;
}

export interface Catalog {
  sites: CatalogSite[];
}

const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export function parseCatalog(text: string): Catalog {
  const raw = parseYaml(text) as { sites?: unknown };
  if (!raw || !Array.isArray(raw.sites)) {
    throw new Error('catalog.yaml must have a sites array');
  }
  const sites: CatalogSite[] = raw.sites.map((row, i) => {
    const s = row as Partial<CatalogSite>;
    for (const key of [
      'id',
      'source_repo',
      'directory',
      'hostname',
      'netlify_site',
      'agent',
      'production_pin',
      'pin_file',
    ] as const) {
      if (!s[key] || typeof s[key] !== 'string') {
        throw new Error(`catalog sites[${i}].${key} must be a string`);
      }
    }
    if (s.source_repo === 'MajestaNet/ide') {
      throw new Error('catalog must not use retired source MajestaNet/ide');
    }
    if (!REPO.test(s.source_repo as string)) {
      throw new Error(`catalog sites[${i}].source_repo is not owner/repo`);
    }
    if (s.production_pin !== 'tag-v' && s.production_pin !== 'main') {
      throw new Error(`catalog sites[${i}].production_pin must be tag-v or main`);
    }
    return s as CatalogSite;
  });
  const ids = new Set<string>();
  const repos = new Set<string>();
  const directories = new Set<string>();
  const hostnames = new Set<string>();
  const netlifySites = new Set<string>();
  for (const s of sites) {
    if (s.id === '_template' || s.directory === 'sites/_template') {
      throw new Error('catalog must not register sites/_template');
    }
    if (ids.has(s.id)) throw new Error(`duplicate catalog id ${s.id}`);
    if (repos.has(s.source_repo)) throw new Error(`duplicate source_repo ${s.source_repo}`);
    if (directories.has(s.directory)) throw new Error(`duplicate catalog directory ${s.directory}`);
    if (hostnames.has(s.hostname)) throw new Error(`duplicate catalog hostname ${s.hostname}`);
    if (netlifySites.has(s.netlify_site)) {
      throw new Error(`duplicate catalog netlify_site ${s.netlify_site}`);
    }
    ids.add(s.id);
    repos.add(s.source_repo);
    directories.add(s.directory);
    hostnames.add(s.hostname);
    netlifySites.add(s.netlify_site);
  }
  return { sites };
}

export function readCatalog(path: string): Catalog {
  return parseCatalog(readFileSync(path, 'utf8'));
}

export function siteBySource(catalog: Catalog, source: string): CatalogSite | undefined {
  return catalog.sites.find((s) => s.source_repo === source);
}

export function siteById(catalog: Catalog, id: string): CatalogSite | undefined {
  return catalog.sites.find((s) => s.id === id);
}
