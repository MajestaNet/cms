import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { pageBySourceFile, type ContentMap } from './content-map.ts';
import { rewriteMarkdownLinks, type LinkRewriteContext } from './links.ts';
import type { ResolvedSource } from './source.ts';

type Root = ReturnType<typeof fromMarkdown>;

export interface CmsRemarkOptions {
  source: ResolvedSource;
  map: ContentMap;
  expanded: Record<string, string[]>;
}

export function pageFromDocsFile(filename: string | undefined): string | undefined {
  if (!filename) return undefined;
  const normalized = filename.replace(/\\/g, '/');
  const match = normalized.match(/\/src\/content\/docs\/(.+)\.(md|mdx)$/);
  if (!match) return undefined;
  let rel = match[1];
  if (rel === 'index') return '/';
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length);
  return `/${rel}`;
}

function heading(depth: 2 | 3, text: string) {
  return {
    type: 'heading' as const,
    depth,
    children: [{ type: 'text' as const, value: text }],
  };
}

export function remarkCmsSources(opts: CmsRemarkOptions) {
  const bySource = pageBySourceFile(opts.map, opts.expanded);
  return function attacher() {
    return function transform(
      tree: Root,
      file: { path?: string; data?: { astro?: { frontmatter?: Record<string, unknown> } } },
    ) {
      const fromFm = file.data?.astro?.frontmatter?.cmsPage;
      const cmsPage =
        (typeof fromFm === 'string' ? fromFm : undefined) ?? pageFromDocsFile(file.path);
      if (!cmsPage) return;
      const spec = opts.map.pages[cmsPage];
      if (!spec || !spec.include) return;
      const files = opts.expanded[cmsPage] ?? [];
      if (files.length === 0) return;

      tree.children.push({ type: 'thematicBreak' });
      tree.children.push(heading(2, 'From the product repository'));

      for (const rel of files) {
        const ctx: LinkRewriteContext = {
          fromFile: rel,
          sourceRepo: opts.source.site.source_repo,
          blobRef: opts.source.blobRef,
          pageBySource: bySource,
        };
        const markdown = readFileSync(join(opts.source.root, rel), 'utf8');
        const rewritten = rewriteMarkdownLinks(markdown, ctx).replace(/^# /m, '## ');
        const srcTree = fromMarkdown(rewritten);
        if (files.length > 1) {
          tree.children.push(heading(3, rel));
        }
        for (const child of srcTree.children) {
          tree.children.push(child);
        }
      }
    };
  };
}
