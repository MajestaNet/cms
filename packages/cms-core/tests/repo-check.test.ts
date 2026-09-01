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

  it('checks One against fixtures while pin is unset', async () => {
    const results = await checkAllSites(repoRoot);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('one');
    expect(results[0].mode).toBe('fixture');
    expect(results[0].pin).toBe('unset');
    expect(results[0].pages['/install']).toEqual(['docs/self-host.md']);
    expect(results[0].pages['/modules']).toEqual(['docs/modules/README.md', 'docs/modules/core.md']);
  });

  it('still uses fixtures when Netlify injects CONTEXT=production into npm test', async () => {
    process.env.CONTEXT = 'production';
    process.env.URL = 'https://majesta-one-docs.netlify.app';
    const results = await checkAllSites(repoRoot);
    expect(results[0].mode).toBe('fixture');
  });

  it('refuses production publish while pin is unset', async () => {
    process.env.CMS_PRODUCTION = '1';
    await expect(resolveSource({ repoRoot, siteId: 'one' })).rejects.toThrow(
      /refusing production publish/,
    );
  });
});
