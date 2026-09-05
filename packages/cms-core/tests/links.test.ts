import { describe, expect, it } from 'vitest';
import { classifyHref, rewriteMarkdownLinks, type LinkRewriteContext } from '../src/links.ts';

function ctx(overrides: Partial<LinkRewriteContext> = {}): LinkRewriteContext {
  return {
    fromFile: 'docs/self-host.md',
    sourceRepo: 'MajestaNet/one',
    blobRef: 'v0.1.0',
    pageBySource: new Map([
      ['docs/self-host.md', '/install'],
      ['docs/builder-connect.md', '/connect'],
      ['docs/glossary.md', '/'],
    ]),
    publicPages: new Set(['/', '/install', '/connect', '/api/families']),
    treeFiles: new Set([
      'docs/self-host.md',
      'docs/builder-connect.md',
      'docs/glossary.md',
      'docs/adr/006-jwt-auth.md',
      'deploy/digitalocean/app.yaml',
      'SECURITY.md',
    ]),
    emitGithub: true,
    ...overrides,
  };
}

describe('classifyHref', () => {
  it('rewrites mapped relative files to the public page', () => {
    expect(classifyHref('./builder-connect.md', ctx())).toEqual({
      action: 'rewrite',
      href: '/connect',
    });
    expect(classifyHref('glossary.md#nouns', ctx())).toEqual({
      action: 'rewrite',
      href: '/#nouns',
    });
  });

  it('keeps already-public site paths instead of treating them as repo files', () => {
    expect(classifyHref('/install', ctx())).toEqual({ action: 'rewrite', href: '/install' });
    expect(classifyHref('/api/families#auth', ctx())).toEqual({
      action: 'rewrite',
      href: '/api/families#auth',
    });
    expect(classifyHref('/connect/', ctx())).toEqual({ action: 'rewrite', href: '/connect' });
  });

  it('unwraps playbooks, backlog, and other forbidden sources (do not nav them)', () => {
    expect(classifyHref('./architecture/agent-public-docs.md', ctx())).toEqual({
      action: 'unwrap',
    });
    expect(classifyHref('../AGENTS.md', ctx())).toEqual({ action: 'unwrap' });
    expect(classifyHref('../backlog/BP-067-public-docs-site.md', ctx())).toEqual({
      action: 'unwrap',
    });
    expect(classifyHref('./architecture/foo-build-plan.md', ctx())).toEqual({ action: 'unwrap' });
  });

  it('emits GitHub blob for real unmapped files when emitGithub is on', () => {
    expect(classifyHref('../SECURITY.md', ctx())).toEqual({
      action: 'rewrite',
      href: 'https://github.com/MajestaNet/one/blob/v0.1.0/SECURITY.md',
    });
    expect(classifyHref('../deploy/digitalocean/app.yaml', ctx())).toEqual({
      action: 'rewrite',
      href: 'https://github.com/MajestaNet/one/blob/v0.1.0/deploy/digitalocean/app.yaml',
    });
  });

  it('emits GitHub tree for directories that exist in the source tree', () => {
    expect(classifyHref('../deploy/digitalocean/', ctx())).toEqual({
      action: 'rewrite',
      href: 'https://github.com/MajestaNet/one/tree/v0.1.0/deploy/digitalocean',
    });
  });

  it('unwraps unknown paths instead of emitting a 404 GitHub blob', () => {
    expect(classifyHref('./no-such-doc.md', ctx())).toEqual({ action: 'unwrap' });
    expect(classifyHref('/not-a-page', ctx())).toEqual({ action: 'unwrap' });
  });

  it('does not emit GitHub URLs in fixture mode', () => {
    expect(classifyHref('../SECURITY.md', ctx({ emitGithub: false }))).toEqual({
      action: 'unwrap',
    });
  });

  it('leaves http(s) and in-page hashes alone', () => {
    expect(classifyHref('https://example.com/x', ctx())).toEqual({
      action: 'keep',
      href: 'https://example.com/x',
    });
    expect(classifyHref('#step-2', ctx())).toEqual({ action: 'keep', href: '#step-2' });
  });
});

describe('rewriteMarkdownLinks', () => {
  it('rewrites mapped links, GitHub for real files, and unwraps dead/forbidden ones', () => {
    const out = rewriteMarkdownLinks(
      [
        'See [connect](builder-connect.md) and [plan](architecture/foo-build-plan.md).',
        '',
        'Claim file: [app.yaml](../deploy/digitalocean/app.yaml).',
        '',
        'Broken: [missing](no-such.md).',
        '',
        'Site path: [install](/install).',
        '',
        '![x](../no-such.png)',
        '',
      ].join('\n'),
      ctx(),
    );
    expect(out).toContain('](/connect)');
    expect(out).toContain('plan');
    expect(out).not.toContain('foo-build-plan.md');
    expect(out).toContain('https://github.com/MajestaNet/one/blob/v0.1.0/deploy/digitalocean/app.yaml');
    expect(out).toContain('Broken: missing.');
    expect(out).not.toContain('no-such.md');
    expect(out).toContain('](/install)');
    expect(out).not.toContain('no-such.png');
  });

  it('round-trips GFM tables and rewrites links inside cells', () => {
    const out = rewriteMarkdownLinks(
      [
        '| Next | Link |',
        '|---|---|',
        '| Connect | [connect](builder-connect.md) |',
        '',
      ].join('\n'),
      ctx(),
    );
    expect(out).toMatch(/\| Next\s+\| Link\s+\|/);
    expect(out).toContain('](/connect)');
    expect(out).not.toContain('builder-connect.md');
  });
});
