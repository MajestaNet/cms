import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { parse as parseYaml } from 'yaml';
import { visit } from 'unist-util-visit';
import type { ContentMap } from './content-map.ts';
import { asPublicPage, normalizePublicPath, publicPagesFromRoutes } from './links.ts';

const PLACEHOLDER = /\b(TODO|FIXME)\b/;
const STATIC_ASSETS = new Set(['/favicon.svg', '/apple-touch-icon.png']);

export function overlayRelPath(page: string): string {
  const route = normalizePublicPath(page);
  if (route === '/') return 'src/content/docs/index.md';
  return `src/content/docs${route}.md`;
}

export interface OverlayFrontmatter {
  title?: unknown;
  description?: unknown;
  cmsPage?: unknown;
  template?: unknown;
}

export function splitOverlay(text: string): { fm: OverlayFrontmatter; body: string } {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error('overlay page must start with YAML frontmatter (--- … ---)');
  }
  const fm = parseYaml(match[1]) as OverlayFrontmatter;
  return { fm: fm ?? {}, body: match[2] };
}

export function overlayInternalHrefs(body: string): string[] {
  const tree = fromMarkdown(body);
  const hrefs: string[] = [];
  visit(tree, (node) => {
    if ((node.type === 'link' || node.type === 'image') && typeof node.url === 'string') {
      hrefs.push(node.url);
    }
  });
  return hrefs;
}

export interface OverlayCheckIssue {
  file: string;
  message: string;
}

function isExternalOrHash(href: string): boolean {
  const [path] = href.split('#');
  if (!path || path.startsWith('#')) return true;
  return /^(https?:|mailto:|tel:)/i.test(path);
}

export function checkOverlayBody(
  body: string,
  publicPages: Set<string>,
  file: string,
): OverlayCheckIssue[] {
  const issues: OverlayCheckIssue[] = [];
  if (PLACEHOLDER.test(body)) {
    issues.push({ file, message: 'overlay contains TODO or FIXME — finish the customer cut' });
  }
  const lead = body.trim();
  if (!lead) {
    issues.push({ file, message: 'overlay body is empty; every page needs a customer lead' });
  }
  for (const href of overlayInternalHrefs(body)) {
    if (isExternalOrHash(href)) continue;
    const [path] = href.split('#');
    if (STATIC_ASSETS.has(path)) continue;
    if (path.startsWith('/') && !path.startsWith('//')) {
      const page = asPublicPage(path, publicPages);
      if (page) continue;
      issues.push({
        file,
        message: `dead or unmapped site link: ${href} (must be a content-map page)`,
      });
      continue;
    }
    issues.push({
      file,
      message: `overlay link must be a site path or https URL, not repo-relative: ${href}`,
    });
  }
  return issues;
}

export interface OverlayCheckResult {
  issues: OverlayCheckIssue[];
  pages: string[];
}

export async function checkOverlayPages(
  siteDir: string,
  map: ContentMap,
): Promise<OverlayCheckResult> {
  const publicPages = publicPagesFromRoutes(Object.keys(map.pages));
  const issues: OverlayCheckIssue[] = [];
  const docsRoot = join(siteDir, 'src/content/docs');

  for (const page of Object.keys(map.pages)) {
    const rel = overlayRelPath(page);
    const full = join(siteDir, rel);
    if (!existsSync(full)) {
      issues.push({ file: rel, message: `missing overlay for content-map page ${page}` });
      continue;
    }
    let text: string;
    try {
      text = readFileSync(full, 'utf8');
    } catch (err) {
      issues.push({ file: rel, message: `cannot read overlay: ${err}` });
      continue;
    }
    let fm: OverlayFrontmatter;
    let body: string;
    try {
      ({ fm, body } = splitOverlay(text));
    } catch (err) {
      issues.push({ file: rel, message: err instanceof Error ? err.message : String(err) });
      continue;
    }
    if (typeof fm.title !== 'string' || !fm.title.trim()) {
      issues.push({ file: rel, message: 'frontmatter title is required' });
    }
    if (typeof fm.description !== 'string' || !fm.description.trim()) {
      issues.push({ file: rel, message: 'frontmatter description is required' });
    }
    if (fm.cmsPage !== page) {
      issues.push({
        file: rel,
        message: `cmsPage must be ${page} (got ${JSON.stringify(fm.cmsPage)})`,
      });
    }
    issues.push(...checkOverlayBody(body, publicPages, rel));
  }

  if (existsSync(docsRoot)) {
    for await (const rel of glob('**/*.{md,mdx}', { cwd: docsRoot })) {
      const posixRel = rel.replace(/\\/g, '/');
      if (posixRel === '404.md' || posixRel.endsWith('/404.md')) continue;
      const file = `src/content/docs/${posixRel}`;
      const full = join(docsRoot, posixRel);
      const text = readFileSync(full, 'utf8');
      let fm: OverlayFrontmatter;
      try {
        ({ fm } = splitOverlay(text));
      } catch (err) {
        issues.push({ file, message: err instanceof Error ? err.message : String(err) });
        continue;
      }
      if (typeof fm.cmsPage !== 'string') {
        issues.push({ file, message: 'cmsPage frontmatter is required (except 404.md)' });
        continue;
      }
      if (!map.pages[fm.cmsPage]) {
        issues.push({ file, message: `cmsPage ${fm.cmsPage} is not in content-map.yaml` });
      }
      const expected = overlayRelPath(fm.cmsPage);
      if (expected !== file) {
        issues.push({
          file,
          message: `file path does not match cmsPage ${fm.cmsPage} (expected ${expected})`,
        });
      }
    }
  }

  return { issues, pages: Object.keys(map.pages).sort() };
}

export function formatOverlayIssues(issues: OverlayCheckIssue[]): string {
  return issues.map((i) => `${i.file}: ${i.message}`).join('\n');
}
