import { posix } from 'node:path';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toMarkdown } from 'mdast-util-to-markdown';
import { visit } from 'unist-util-visit';

type Root = ReturnType<typeof fromMarkdown>;

export interface LinkRewriteContext {
  fromFile: string;
  sourceRepo: string;
  /** GitHub blob ref: pin tag/sha, or HEAD when unpublished. */
  blobRef: string;
  /** source file → public page path (`/install`) */
  pageBySource: Map<string, string>;
}

function githubBlob(repo: string, ref: string, file: string): string {
  return `https://github.com/${repo}/blob/${ref}/${file}`;
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

export function rewriteHref(href: string, ctx: LinkRewriteContext): string {
  const hashIndex = href.indexOf('#');
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  if (!withoutHash || withoutHash.startsWith('#')) return href;
  if (/^(https?:|mailto:|tel:)/i.test(withoutHash)) return href;

  const repoPath = normalizeRepoPath(ctx.fromFile, withoutHash);
  if (repoPath === null) return href;
  if (repoPath === '') return href;

  const page = ctx.pageBySource.get(repoPath);
  if (page) {
    const url = page === '/' ? '/' : page;
    return `${url}${hash}`;
  }
  return `${githubBlob(ctx.sourceRepo, ctx.blobRef, repoPath)}${hash}`;
}

export function rewriteMarkdownLinks(markdown: string, ctx: LinkRewriteContext): string {
  const tree = fromMarkdown(markdown) as Root;
  visit(tree, (node) => {
    if (node.type === 'link' || node.type === 'image') {
      node.url = rewriteHref(node.url, ctx);
    }
    if (node.type === 'definition' && typeof node.url === 'string') {
      node.url = rewriteHref(node.url, ctx);
    }
  });
  return toMarkdown(tree);
}

export function parseMarkdown(markdown: string): Root {
  return fromMarkdown(markdown);
}
