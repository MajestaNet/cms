import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ChromeCheckIssue {
  file: string;
  message: string;
}

const STARLIGHT_OVERRIDES = [
  'ThemeProvider',
  'TwoColumnContent',
  'PageSidebar',
  'Head',
  'Header',
] as const;

function read(siteDir: string, rel: string): string | undefined {
  const full = join(siteDir, rel);
  if (!existsSync(full)) return undefined;
  return readFileSync(full, 'utf8');
}

function has(text: string, pattern: RegExp | string): boolean {
  return typeof pattern === 'string' ? text.includes(pattern) : pattern.test(text);
}

function requireFile(
  issues: ChromeCheckIssue[],
  siteDir: string,
  rel: string,
): string | undefined {
  const text = read(siteDir, rel);
  if (text === undefined) {
    issues.push({ file: rel, message: 'required chrome file is missing' });
  }
  return text;
}

function requireMatch(
  issues: ChromeCheckIssue[],
  file: string,
  text: string | undefined,
  pattern: RegExp | string,
  message: string,
): void {
  if (text === undefined) return;
  if (!has(text, pattern)) issues.push({ file, message });
}

function requireAbsent(
  issues: ChromeCheckIssue[],
  file: string,
  text: string | undefined,
  pattern: RegExp | string,
  message: string,
): void {
  if (text === undefined) return;
  if (has(text, pattern)) issues.push({ file, message });
}

/**
 * Mechanical chrome contract for a Starlight product host.
 * Overlay ingest must not drop ClientRouter, the reserved right column, or
 * the no-morph view-transition rules — those are what stop the shell from
 * looking like it reloads on every sidebar click.
 */
export function checkSiteChrome(siteDir: string): ChromeCheckIssue[] {
  const issues: ChromeCheckIssue[] = [];

  const astroRel = 'astro.config.mjs';
  const astro = requireFile(issues, siteDir, astroRel);
  requireMatch(
    issues,
    astroRel,
    astro,
    /prefetch:\s*(true|\{)/,
    'must enable Astro prefetch so sidebar targets are warmed before click',
  );
  requireMatch(
    issues,
    astroRel,
    astro,
    /tableOfContents:\s*false/,
    'must set tableOfContents: false — a TOC that exists only on some pages reflows the article',
  );
  for (const name of STARLIGHT_OVERRIDES) {
    requireMatch(
      issues,
      astroRel,
      astro,
      new RegExp(`${name}:\\s*['\"]\\.\\/src\\/components\\/${name}\\.astro['\"]`),
      `must override Starlight ${name} (sites/_template copy)`,
    );
  }

  const themeRel = 'src/components/ThemeProvider.astro';
  const theme = requireFile(issues, siteDir, themeRel);
  requireMatch(
    issues,
    themeRel,
    theme,
    /from ['"]astro:transitions['"]/,
    'must import ClientRouter from astro:transitions',
  );
  requireMatch(
    issues,
    themeRel,
    theme,
    /<ClientRouter\b/,
    'must render <ClientRouter> so sidebar clicks swap the article instead of remounting the shell',
  );
  requireMatch(
    issues,
    themeRel,
    theme,
    /fallback=["']swap["']/,
    'ClientRouter must use fallback="swap" (no fade fallback when view transitions are missing)',
  );
  requireMatch(
    issues,
    themeRel,
    theme,
    /astro:after-swap/,
    'must listen for astro:after-swap to keep data-theme="light" and close the mobile menu',
  );

  const headerRel = 'src/components/Header.astro';
  const header = requireFile(issues, siteDir, headerRel);
  requireMatch(
    issues,
    headerRel,
    header,
    /transition:persist/,
    'header must set transition:persist so search and the lockup are not remounted on each click',
  );

  const twoRel = 'src/components/TwoColumnContent.astro';
  const two = requireFile(issues, siteDir, twoRel);
  requireMatch(
    issues,
    twoRel,
    two,
    'right-sidebar-container',
    'must always reserve the right column on doc pages',
  );
  requireMatch(
    issues,
    twoRel,
    two,
    /reserveAside/,
    'must keep reserveAside so included-source pages do not grow a TOC column the overlay-only pages lack',
  );

  const pageSidebarRel = 'src/components/PageSidebar.astro';
  const pageSidebar = requireFile(issues, siteDir, pageSidebarRel);
  requireAbsent(
    issues,
    pageSidebarRel,
    pageSidebar,
    /TableOfContents/,
    'PageSidebar must not render Starlight’s “On this page” TOC',
  );

  const cssRel = 'src/styles/custom.css';
  const css = requireFile(issues, siteDir, cssRel);
  requireAbsent(
    issues,
    cssRel,
    css,
    /@view-transition\s*\{[^}]*navigation:\s*auto/,
    'must not enable MPA @view-transition { navigation: auto } — that morphs header and nav on heavy included pages',
  );
  requireMatch(
    issues,
    cssRel,
    css,
    /@view-transition[\s\S]*?navigation:\s*none/,
    'must set @view-transition { navigation: none } so a full load does not morph the shell',
  );
  for (const name of ['mn-header', 'mn-sidebar', 'mn-aside']) {
    requireMatch(
      issues,
      cssRel,
      css,
      `view-transition-name: ${name}`,
      `must name ${name} so the shell is excluded from the root snapshot`,
    );
  }
  requireMatch(
    issues,
    cssRel,
    css,
    /::view-transition-old\(root\)[\s\S]*?animation:\s*none/,
    'root view-transition must use animation: none (a 0.16s crossfade looks like a full reload)',
  );
  requireMatch(
    issues,
    cssRel,
    css,
    /starlight-toc/,
    'must hide leftover Starlight TOC chrome',
  );

  const themeJsRel = 'public/theme-light.js';
  const themeJs = requireFile(issues, siteDir, themeJsRel);
  requireMatch(
    issues,
    themeJsRel,
    themeJs,
    /dataset\.theme\s*=\s*['"]light['"]/,
    'must force data-theme="light" before first paint',
  );
  requireMatch(
    issues,
    themeJsRel,
    themeJs,
    /astro:after-swap/,
    'must re-apply light theme after ClientRouter swaps (new documents emit data-theme="dark")',
  );

  return issues;
}

export function formatChromeIssues(siteId: string, issues: ChromeCheckIssue[]): string {
  return issues.map((i) => `${siteId} chrome ${i.file}: ${i.message}`).join('\n');
}

export function assertSiteChrome(siteDir: string, siteId: string): void {
  const issues = checkSiteChrome(siteDir);
  if (issues.length > 0) {
    throw new Error(formatChromeIssues(siteId, issues));
  }
}
