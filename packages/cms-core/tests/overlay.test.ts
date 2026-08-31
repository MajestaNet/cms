import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseContentMap } from '../src/content-map.ts';
import {
  checkOverlayPages,
  overlayRelPath,
  splitOverlay,
  checkOverlayBody,
} from '../src/overlay.ts';
import { publicPagesFromRoutes } from '../src/links.ts';

const oneDir = join(dirname(fileURLToPath(import.meta.url)), '../../../sites/one');

describe('overlayRelPath', () => {
  it('maps content-map keys to Starlight files', () => {
    expect(overlayRelPath('/')).toBe('src/content/docs/index.md');
    expect(overlayRelPath('/install')).toBe('src/content/docs/install.md');
    expect(overlayRelPath('/api/families')).toBe('src/content/docs/api/families.md');
  });
});

describe('checkOverlayBody', () => {
  const pages = publicPagesFromRoutes(['/', '/install', '/connect']);

  it('accepts site paths and https', () => {
    expect(checkOverlayBody('See [Install](/install) and [src](https://github.com/x).', pages, 'x')).toEqual(
      [],
    );
  });

  it('rejects unmapped site paths and repo-relative links', () => {
    const issues = checkOverlayBody(
      'Go [nowhere](/missing) or [rel](../docs/self-host.md). TODO later.',
      pages,
      'src/content/docs/x.md',
    );
    expect(issues.map((i) => i.message).join('\n')).toMatch(/dead or unmapped/);
    expect(issues.map((i) => i.message).join('\n')).toMatch(/repo-relative/);
    expect(issues.map((i) => i.message).join('\n')).toMatch(/TODO or FIXME/);
  });
});

describe('sites/one overlay', () => {
  it('passes the quality checker', async () => {
    const map = parseContentMap(readFileSync(join(oneDir, 'content-map.yaml'), 'utf8'));
    const result = await checkOverlayPages(oneDir, map);
    expect(result.issues).toEqual([]);
    expect(result.pages).toContain('/install');
    expect(result.pages).toContain('/api/families');
  });
});

describe('checkOverlayPages', () => {
  it('fails when cmsPage does not match the map', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cms-ov-'));
    mkdirSync(join(dir, 'src/content/docs'), { recursive: true });
    writeFileSync(
      join(dir, 'src/content/docs/index.md'),
      '---\ntitle: Hi\ndescription: d\ncmsPage: /\n---\n\nHello.\n',
    );
    const map = parseContentMap(`
pages:
  /:
    sources: [README.md]
    include: false
  /install:
    sources: [docs/self-host.md]
`);
    const result = await checkOverlayPages(dir, map);
    expect(result.issues.some((i) => i.message.includes('missing overlay'))).toBe(true);
  });
});

describe('splitOverlay', () => {
  it('requires frontmatter', () => {
    expect(() => splitOverlay('# no fm\n')).toThrow(/frontmatter/);
  });
});
