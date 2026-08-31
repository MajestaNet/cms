import { describe, expect, it } from 'vitest';
import { parseNotify, routeNotify } from '../src/notify.ts';
import { parseCatalog } from '../src/catalog.ts';

const catalog = parseCatalog(`
sites:
  - id: one
    source_repo: MajestaNet/one
    directory: sites/one
    hostname: one.majesta.net
    netlify_site: majesta-one-docs
    agent: sites/one/AGENT.md
    production_pin: tag-v
    pin_file: sites/one/pin
`);

const valid = {
  source: 'MajestaNet/one',
  kind: 'merge',
  ref: 'refs/heads/main',
  sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  base: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  merged_pr: 12,
  skip: false,
  skip_reason: null,
  paths: ['docs/api-families.md', 'internal/httpapi/client_extras.go'],
};

describe('parseNotify', () => {
  it('accepts a contract payload', () => {
    expect(parseNotify(valid).source).toBe('MajestaNet/one');
    expect(parseNotify(JSON.stringify(valid)).kind).toBe('merge');
  });

  it('rejects retired ide source', () => {
    expect(() => parseNotify({ ...valid, source: 'MajestaNet/ide' })).toThrow(/retired/);
  });

  it('rejects backslash paths and parent segments', () => {
    expect(() => parseNotify({ ...valid, paths: ['docs\\\\foo'] })).toThrow(/forward-slash/);
    expect(() => parseNotify({ ...valid, paths: ['../secret'] })).toThrow(/forward-slash/);
  });

  it('requires skip boolean and kind enum', () => {
    expect(() => parseNotify({ ...valid, skip: 'yes' })).toThrow(/skip/);
    expect(() => parseNotify({ ...valid, kind: 'push' })).toThrow(/kind/);
  });
});

describe('routeNotify', () => {
  it('routes MajestaNet/one to site one', () => {
    expect(routeNotify(parseNotify(valid), catalog)).toEqual({
      action: 'update',
      siteId: 'one',
      kind: 'merge',
    });
  });

  it('skips when skip is true', () => {
    const payload = parseNotify({ ...valid, skip: true, skip_reason: 'no-mapped-paths' });
    expect(routeNotify(payload, catalog)).toEqual({
      action: 'skip',
      reason: 'no-mapped-paths',
    });
  });

  it('does not apply One routing to an unknown product', () => {
    const payload = parseNotify({ ...valid, source: 'MajestaNet/two' });
    expect(routeNotify(payload, catalog)).toEqual({
      action: 'unknown-source',
      source: 'MajestaNet/two',
    });
  });
});
