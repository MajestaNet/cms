import { posix } from 'node:path';
import { visit } from 'unist-util-visit';
import { isForbiddenSource } from './ignore.ts';
import { parseGfmMarkdown, stringifyGfmMarkdown, type MarkdownRoot } from './markdown.ts';

type Root = MarkdownRoot;

export interface LinkRewriteContext {
  fromFile: string;
  sourceRepo: string;
  /** GitHub blob ref: pin tag/sha. Unused when emitGithub is false. */
  blobRef: string;
  /** source file → public page path (`/install`) */
  pageBySource: Map<string, string>;
  /** Public routes this site actually serves (`/`, `/install`, …). */
  publicPages: Set<string>;
  /** File paths present in the source tree at the pin/fixture. */
  treeFiles: Set<string>;
  /**
   * Emit GitHub blob/tree URLs for real, non-forbidden source files.
   * False while pin is unset (fixture builds) so we never invent HEAD links that 404.
   */
  emitGithub: boolean;
}

export type LinkDecision =
  | { action: 'keep'; href: string }
  | { action: 'rewrite'; href: string }
  | { action: 'unwrap' };

function githubBlob(repo: string, ref: string, file: string): string {
  return `https://github.com/${repo}/blob/${ref}/${file}`;
}

function githubTree(repo: string, ref: string, dir: string): string {
  return `https://github.com/${repo}/tree/${ref}/${dir}`;
}

function splitHash(href: string): { path: string; hash: string } {
  const hashIndex = href.indexOf('#');
  if (hashIndex < 0) return { path: href, hash: '' };
  return { path: href.slice(0, hashIndex), hash: href.slice(hashIndex) };
}

/** `/install/` → `/install`; empty or `/` → `/`. */
export function normalizePublicPath(path: string): string {
  if (!path || path === '/') return '/';
  return path.replace(/\/+$/, '') || '/';
}

const FILE_EXT = /\.(md|mdx|markdown|png|jpe?g|gif|svg|webp|pdf|ya?ml|json|go|ts|js|mjs|cjs|toml)$/i;

/**
 * Absolute site paths (`/install`, `/api/families#auth`) as opposed to repo files
 * (`/docs/self-host.md`) or protocol-relative URLs.
 */
export function asPublicPage(hrefPath: string, publicPages: Set<string>): string | null {
  if (!hrefPath.startsWith('/') || hrefPath.startsWith('//')) return null;
  if (FILE_EXT.test(hrefPath)) return null;
  const normalized = normalizePublicPath(hrefPath);
  return publicPages.has(normalized) ? normalized : null;
}

export function publicPagesFromRoutes(routes: Iterable<string>): Set<string> {
  const out = new Set<string>();
  for (const route of routes) out.add(normalizePublicPath(route));
  if (!out.has('/')) out.add('/');
  return out;
}

function normalizeRepoPath(fromFile: string, href: string): string | null {
  const [pathPart] = href.split('#');
  if (!pathPart) return '';
  if (/^[a-z]+:/i.test(pathPart)) return null;
  if (pathPart.startsWith('//')) return null;
  let resolved: string;
  if (pathPart.startsWith('/')) {
    resolved = pathPart.replace(/^\/+/, '');
  } else {
    resolved = posix.normalize(posix.join(posix.dirname(fromFile), pathPart));
  }
  if (resolved === '.' || resolved.startsWith('../')) return null;
  return resolved.replace(/^\.\//, '');
}

function isTreeFile(path: string, files: Set<string>): boolean {
  return files.has(path);
}

function isTreeDir(path: string, files: Set<string>): boolean {
  const prefix = path.endsWith('/') ? path : `${path}/`;
  for (const f of files) {
    if (f.startsWith(prefix)) return true;
  }
  return false;
}

export function classifyHref(href: string, ctx: LinkRewriteContext): LinkDecision {
  const { path: withoutHash, hash } = splitHash(href);
  if (!withoutHash || withoutHash.startsWith('#')) return { action: 'keep', href };
  if (/^(https?:|mailto:|tel:)/i.test(withoutHash)) return { action: 'keep', href };

  const sitePage = asPublicPage(withoutHash, ctx.publicPages);
  if (sitePage) {
    const url = sitePage === '/' ? '/' : sitePage;
    return { action: 'rewrite', href: `${url}${hash}` };
  }

  const repoPath = normalizeRepoPath(ctx.fromFile, withoutHash);
  if (repoPath === null || repoPath === '') return { action: 'unwrap' };

  const page = ctx.pageBySource.get(repoPath);
  if (page) {
    const url = page === '/' ? '/' : page;
    return { action: 'rewrite', href: `${url}${hash}` };
  }

  if (isForbiddenSource(repoPath)) return { action: 'unwrap' };

  if (ctx.emitGithub) {
    if (isTreeFile(repoPath, ctx.treeFiles)) {
      return { action: 'rewrite', href: `${githubBlob(ctx.sourceRepo, ctx.blobRef, repoPath)}${hash}` };
    }
    if (isTreeDir(repoPath, ctx.treeFiles)) {
      const dir = repoPath.replace(/\/+$/, '');
      return { action: 'rewrite', href: `${githubTree(ctx.sourceRepo, ctx.blobRef, dir)}${hash}` };
    }
  }

  return { action: 'unwrap' };
}

/** @deprecated prefer classifyHref; unwrap decisions become the original href. */
export function rewriteHref(href: string, ctx: LinkRewriteContext): string {
  const decision = classifyHref(href, ctx);
  if (decision.action === 'unwrap') return href;
  return decision.href;
}

function applyDecision(
  url: string,
  ctx: LinkRewriteContext,
): { url?: string; unwrap: boolean } {
  const decision = classifyHref(url, ctx);
  if (decision.action === 'unwrap') return { unwrap: true };
  return { unwrap: false, url: decision.href };
}

export function rewriteMarkdownLinks(markdown: string, ctx: LinkRewriteContext): string {
  const tree = parseGfmMarkdown(markdown);
  visit(tree, (node, index, parent) => {
    if (!parent || typeof index !== 'number') return;
    if (node.type === 'link' || node.type === 'image' || node.type === 'definition') {
      if (typeof node.url !== 'string') return;
      const result = applyDecision(node.url, ctx);
      if (result.unwrap) {
        if (node.type === 'link') {
          parent.children.splice(index, 1, ...node.children);
          return index;
        }
        if (node.type === 'image') {
          parent.children.splice(index, 1);
          return index;
        }
        // Reference definitions with nowhere to go: drop the definition.
        parent.children.splice(index, 1);
        return index;
      }
      node.url = result.url ?? node.url;
    }
  });
  return stringifyGfmMarkdown(tree);
}

export function parseMarkdown(markdown: string): Root {
  return parseGfmMarkdown(markdown);
}
