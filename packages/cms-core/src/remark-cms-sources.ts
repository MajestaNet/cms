import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { pageBySourceFile, type ContentMap } from './content-map.ts';
import {
  publicPagesFromRoutes,
  rewriteMarkdownLinks,
  type LinkRewriteContext,
} from './links.ts';
import type { ResolvedSource } from './source.ts';

type Root = ReturnType<typeof fromMarkdown>;
type RootContent = Root['children'][number];

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

export function stripYamlFrontmatter(markdown: string): string {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

function headingText(node: { children?: Array<{ type?: string; value?: string }> }): string {
  if (!node.children) return '';
  return node.children
    .map((c) => (c.type === 'text' || c.type === 'inlineCode' ? (c.value ?? '') : ''))
    .join('')
    .trim();
}

export interface IncludedSource {
  title?: string;
  children: RootContent[];
}

/** Rewrite links, drop the source H1 (overlay title is the page header), demote leftover H1s. */
export function includedSourceTree(markdown: string, ctx: LinkRewriteContext): IncludedSource {
  const rewritten = rewriteMarkdownLinks(stripYamlFrontmatter(markdown), ctx);
  const tree = fromMarkdown(rewritten) as Root;
  let title: string | undefined;
  const first = tree.children[0];
  if (first && first.type === 'heading' && first.depth === 1) {
    title = headingText(first);
    tree.children.shift();
  }
  for (const child of tree.children) {
    if (child.type === 'heading' && child.depth === 1) {
      child.depth = 2;
    }
  }
  return { title, children: tree.children };
}

function sectionHeading(text: string): RootContent {
  return {
    type: 'heading',
    depth: 3,
    children: [{ type: 'text', value: text }],
  };
}

export function linkContextForSource(
  rel: string,
  opts: CmsRemarkOptions,
  bySource: Map<string, string>,
): LinkRewriteContext {
  return {
    fromFile: rel,
    sourceRepo: opts.source.site.source_repo,
    blobRef: opts.source.blobRef,
    pageBySource: bySource,
    publicPages: publicPagesFromRoutes(Object.keys(opts.map.pages)),
    treeFiles: new Set(opts.source.treeFiles),
    emitGithub: opts.source.mode === 'pin',
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

      for (const rel of files) {
        const ctx = linkContextForSource(rel, opts, bySource);
        const markdown = readFileSync(join(opts.source.root, rel), 'utf8');
        const included = includedSourceTree(markdown, ctx);
        if (files.length > 1 && included.title) {
          tree.children.push(sectionHeading(included.title));
        }
        for (const child of included.children) {
          tree.children.push(child);
        }
      }
    };
  };
}
