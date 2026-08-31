import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { checkAllSites } from '../src/check.ts';
import { resolveSource } from '../src/source.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('repo content maps', () => {
  afterEach(() => {
    delete process.env.CMS_PRODUCTION;
    delete process.env.CONTEXT;
    delete process.env.NETLIFY_CONTEXT;
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

  it('refuses production publish while pin is unset', async () => {
    process.env.CMS_PRODUCTION = '1';
    await expect(resolveSource({ repoRoot, siteId: 'one' })).rejects.toThrow(
      /refusing production publish/,
    );
  });
});
