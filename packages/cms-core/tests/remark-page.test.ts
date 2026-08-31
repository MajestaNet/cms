import { describe, expect, it } from 'vitest';
import { pageFromDocsFile } from '../src/remark-cms-sources.ts';

describe('pageFromDocsFile', () => {
  it('maps Starlight content paths to content-map keys', () => {
    expect(pageFromDocsFile('/repo/sites/one/src/content/docs/index.mdx')).toBe('/');
    expect(pageFromDocsFile('/repo/sites/one/src/content/docs/install.md')).toBe('/install');
    expect(pageFromDocsFile('/repo/sites/one/src/content/docs/api/families.mdx')).toBe(
      '/api/families',
    );
  });
});
