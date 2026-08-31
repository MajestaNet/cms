import { describe, expect, it } from 'vitest';
import { includedSourceTree, pageFromDocsFile } from '../src/remark-cms-sources.ts';
import type { LinkRewriteContext } from '../src/links.ts';

describe('pageFromDocsFile', () => {
  it('maps Starlight content paths to content-map keys', () => {
    expect(pageFromDocsFile('/repo/sites/one/src/content/docs/index.mdx')).toBe('/');
    expect(pageFromDocsFile('/repo/sites/one/src/content/docs/install.md')).toBe('/install');
    expect(pageFromDocsFile('/repo/sites/one/src/content/docs/api/families.mdx')).toBe(
      '/api/families',
    );
  });
});

const ctx: LinkRewriteContext = {
  fromFile: 'docs/self-host.md',
  sourceRepo: 'MajestaNet/one',
  blobRef: 'HEAD',
  pageBySource: new Map([['docs/builder-connect.md', '/connect']]),
  publicPages: new Set(['/', '/install', '/connect']),
  treeFiles: new Set(['docs/self-host.md', 'docs/builder-connect.md']),
  emitGithub: false,
};

describe('includedSourceTree', () => {
  it('strips the source H1 so the overlay title stays the only page header', () => {
    const { title, children } = includedSourceTree(
      '# Self-host (fixture)\n\nPath A. See [connect](builder-connect.md).\n',
      ctx,
    );
    expect(title).toBe('Self-host (fixture)');
    expect(children.some((n) => n.type === 'heading' && n.depth === 1)).toBe(false);
    const para = children.find((n) => n.type === 'paragraph');
    expect(JSON.stringify(para)).toContain('/connect');
  });

  it('unwraps off-allowlist links instead of leaving them on the page', () => {
    const { children } = includedSourceTree(
      '# X\n\nSee the [build plan](architecture/public-docs-site-build-plan.md) and [agents](../AGENTS.md).\n',
      ctx,
    );
    const dump = JSON.stringify(children);
    expect(dump).toContain('build plan');
    expect(dump).not.toContain('http');
    expect(dump).not.toContain('AGENTS.md');
  });
});
