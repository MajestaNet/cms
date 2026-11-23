import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkAllSites } from '../src/check.ts';
import { resolveSource } from '../src/source.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');

const PUBLISH_ENV = ['CMS_PRODUCTION', 'CONTEXT', 'NETLIFY_CONTEXT', 'URL'] as const;

describe('repo content maps', () => {
  const prior: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of PUBLISH_ENV) {
      prior[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of PUBLISH_ENV) {
      const value = prior[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('checks both sites at their GitHub pins', async () => {
    const results = await checkAllSites(repoRoot);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.id)).toEqual(['one', 'two']);
    expect(results.map((r) => r.mode)).toEqual(['pin', 'pin']);
    expect(results.map((r) => r.pin)).toEqual([
      'c85b998cfe11051ef6ac52d7d438d2f3bed7eed6',
      '1acb47c3d4492a4f144bdd21cfc485a2d3c4e358',
    ]);
    expect(results[0].pages['/install']).toEqual(['docs/self-host.md']);
    expect(results[0].pages['/modules']).toContain('docs/modules/README.md');
    expect(results[0].pages['/modules']).toContain('docs/modules/core.md');
    expect(results[0].pages['/modules']!.length).toBeGreaterThan(2);
  });

  it('keeps the pinned revision when Netlify injects CONTEXT=production into npm test', async () => {
    process.env.CONTEXT = 'production';
    process.env.URL = 'https://majesta-one-docs.netlify.app';
    const results = await checkAllSites(repoRoot);
    expect(results[0].mode).toBe('pin');
    expect(results[0].pin).toBe('c85b998cfe11051ef6ac52d7d438d2f3bed7eed6');
  });

  it('resolves One for a production publish at the pinned commit', async () => {
    process.env.CMS_PRODUCTION = '1';
    const source = await resolveSource({ repoRoot, siteId: 'one' });
    expect(source.mode).toBe('pin');
    expect(source.blobRef).toBe('c85b998cfe11051ef6ac52d7d438d2f3bed7eed6');
  });
});
