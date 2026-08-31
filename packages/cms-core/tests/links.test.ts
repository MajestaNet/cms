import { describe, expect, it } from 'vitest';
import { rewriteHref, rewriteMarkdownLinks } from '../src/links.ts';

const ctx = {
  fromFile: 'docs/self-host.md',
  sourceRepo: 'MajestaNet/one',
  blobRef: 'v0.1.0',
  pageBySource: new Map([
    ['docs/self-host.md', '/install'],
    ['docs/builder-connect.md', '/connect'],
    ['docs/glossary.md', '/'],
  ]),
};

describe('rewriteHref', () => {
  it('rewrites mapped relative files to the public page', () => {
    expect(rewriteHref('./builder-connect.md', ctx)).toBe('/connect');
    expect(rewriteHref('glossary.md#nouns', ctx)).toBe('/#nouns');
  });

  it('rewrites off-allowlist files to GitHub at the pin', () => {
    expect(rewriteHref('./architecture/agent-public-docs.md', ctx)).toBe(
      'https://github.com/MajestaNet/one/blob/v0.1.0/docs/architecture/agent-public-docs.md',
    );
    expect(rewriteHref('../AGENTS.md', ctx)).toBe(
      'https://github.com/MajestaNet/one/blob/v0.1.0/AGENTS.md',
    );
    expect(rewriteHref('../backlog/BP-067-public-docs-site.md', ctx)).toBe(
      'https://github.com/MajestaNet/one/blob/v0.1.0/backlog/BP-067-public-docs-site.md',
    );
  });

  it('leaves http(s) and in-page hashes alone', () => {
    expect(rewriteHref('https://example.com/x', ctx)).toBe('https://example.com/x');
    expect(rewriteHref('#step-2', ctx)).toBe('#step-2');
  });
});

describe('rewriteMarkdownLinks', () => {
  it('rewrites markdown and images in a document', () => {
    const out = rewriteMarkdownLinks(
      'See [connect](builder-connect.md) and [plan](architecture/foo-build-plan.md).\n\n![x](../brand.png)\n',
      ctx,
    );
    expect(out).toContain('](/connect)');
    expect(out).toContain('https://github.com/MajestaNet/one/blob/v0.1.0/docs/architecture/foo-build-plan.md');
    expect(out).toContain('https://github.com/MajestaNet/one/blob/v0.1.0/brand.png');
  });
});
