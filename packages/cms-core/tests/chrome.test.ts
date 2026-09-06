import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkSiteChrome } from '../src/chrome.ts';

const oneDir = join(dirname(fileURLToPath(import.meta.url)), '../../../sites/one');

const CHROME_FILES = [
  'astro.config.mjs',
  'src/components/ThemeProvider.astro',
  'src/components/Header.astro',
  'src/components/TwoColumnContent.astro',
  'src/components/PageSidebar.astro',
  'src/styles/custom.css',
  'public/theme-light.js',
];

function copyOneChrome(): string {
  const dir = mkdtempSync(join(tmpdir(), 'cms-chrome-'));
  for (const rel of CHROME_FILES) {
    const dest = join(dir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(join(oneDir, rel)));
  }
  return dir;
}

describe('checkSiteChrome', () => {
  it('accepts sites/one', () => {
    expect(checkSiteChrome(oneDir)).toEqual([]);
  });

  it('fails when ClientRouter is dropped from ThemeProvider', () => {
    const dir = copyOneChrome();
    writeFileSync(
      join(dir, 'src/components/ThemeProvider.astro'),
      '---\n/** empty — would remount the shell on every click */\n---\n',
    );
    const messages = checkSiteChrome(dir)
      .map((i) => i.message)
      .join('\n');
    expect(messages).toMatch(/ClientRouter/);
  });

  it('fails when MPA view-transition morph is re-enabled', () => {
    const dir = copyOneChrome();
    const cssPath = join(dir, 'src/styles/custom.css');
    const css = readFileSync(cssPath, 'utf8').replace(
      'navigation: none',
      'navigation: auto',
    );
    writeFileSync(cssPath, css);
    const messages = checkSiteChrome(dir)
      .map((i) => i.message)
      .join('\n');
    expect(messages).toMatch(/navigation: auto/);
    expect(messages).not.toMatch(/required chrome file is missing/);
  });

  it('fails when the right column override is removed', () => {
    const dir = copyOneChrome();
    writeFileSync(
      join(dir, 'astro.config.mjs'),
      readFileSync(join(dir, 'astro.config.mjs'), 'utf8').replace(
        "TwoColumnContent: './src/components/TwoColumnContent.astro',\n",
        '',
      ),
    );
    const messages = checkSiteChrome(dir)
      .map((i) => i.message)
      .join('\n');
    expect(messages).toMatch(/TwoColumnContent/);
  });

  it('fails when header persist is dropped', () => {
    const dir = copyOneChrome();
    writeFileSync(
      join(dir, 'src/components/Header.astro'),
      readFileSync(join(dir, 'src/components/Header.astro'), 'utf8').replace(
        ' transition:persist="mn-header" transition:animate="none"',
        '',
      ),
    );
    const messages = checkSiteChrome(dir)
      .map((i) => i.message)
      .join('\n');
    expect(messages).toMatch(/transition:persist/);
  });
});
