import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { minimatch } from 'minimatch';
import { isForbiddenSource } from './ignore.ts';

export interface PageMap {
  sources: string[];
  note?: string;
  /** When false, overlay is the page; sources are still required at the pin. Default true. */
  include: boolean;
}

export interface ContentMap {
  pages: Record<string, PageMap>;
}

export function parseContentMap(text: string): ContentMap {
  const raw = parseYaml(text) as { pages?: Record<string, { sources?: unknown; note?: unknown; include?: unknown }> };
  if (!raw?.pages || typeof raw.pages !== 'object') {
    throw new Error('content-map.yaml must have a pages object');
  }
  const pages: Record<string, PageMap> = {};
  for (const [route, spec] of Object.entries(raw.pages)) {
    if (!route.startsWith('/')) {
      throw new Error(`content-map page key must start with /: ${route}`);
    }
    if (!spec || !Array.isArray(spec.sources) || spec.sources.some((s) => typeof s !== 'string')) {
      throw new Error(`content-map ${route}.sources must be a string array`);
    }
    const sources = spec.sources as string[];
    for (const s of sources) {
      if (s.startsWith('/') || s.includes('\\') || s.split('/').includes('..')) {
        throw new Error(`content-map ${route} source must be repo-relative: ${s}`);
      }
    }
    pages[route] = {
      sources,
      note: typeof spec.note === 'string' ? spec.note : undefined,
      include: spec.include !== false,
    };
  }
  return { pages };
}

export function readContentMap(path: string): ContentMap {
  return parseContentMap(readFileSync(path, 'utf8'));
}

export function expandSourcePatterns(patterns: string[], treeFiles: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const pattern of patterns) {
    const matches = treeFiles.filter((f) => minimatch(f, pattern, { dot: false, nocase: false }));
    if (matches.length === 0) {
      throw new Error(`content-map source matched no files at pin: ${pattern}`);
    }
    for (const m of matches.sort()) {
      if (!seen.has(m)) {
        seen.add(m);
        out.push(m);
      }
    }
  }
  return out;
}

export interface MapCheckResult {
  pages: Record<string, string[]>;
}

export function checkContentMap(map: ContentMap, treeFiles: string[]): MapCheckResult {
  const pages: Record<string, string[]> = {};
  for (const [route, spec] of Object.entries(map.pages)) {
    const expanded = expandSourcePatterns(spec.sources, treeFiles);
    for (const file of expanded) {
      if (isForbiddenSource(file)) {
        throw new Error(`content-map ${route} includes forbidden source ${file}`);
      }
    }
    pages[route] = expanded;
  }
  return { pages };
}

/** First public page that lists this source file (stable: sorted routes). */
export function pageBySourceFile(map: ContentMap, expanded: Record<string, string[]>): Map<string, string> {
  const out = new Map<string, string>();
  const routes = Object.keys(expanded).sort();
  for (const route of routes) {
    for (const file of expanded[route]) {
      if (!out.has(file)) out.set(file, route);
    }
  }
  return out;
}
