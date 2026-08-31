import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseCatalog, type Catalog, type CatalogSite } from '../src/catalog.ts';
import {
  checkSiteNetlifyToml,
  parseIgnorePaths,
  requiredIgnorePaths,
} from '../src/netlify.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');

const twoSiteCatalog = parseCatalog(`
sites:
  - id: one
    source_repo: MajestaNet/one
    directory: sites/one
    hostname: one.majesta.net
    netlify_site: majesta-one-docs
    agent: sites/one/AGENT.md
    production_pin: tag-v
    pin_file: sites/one/pin
  - id: two
    source_repo: MajestaNet/two
    directory: sites/two
    hostname: two.majesta.net
    netlify_site: majesta-two-docs
    agent: sites/two/AGENT.md
    production_pin: main
    pin_file: sites/two/pin
`);

function site(catalog: Catalog, id: string): CatalogSite {
  const row = catalog.sites.find((s) => s.id === id);
  if (!row) throw new Error(`missing ${id}`);
  return row;
}

function toml(id: string, extraIgnore = ''): string {
  const ignore = [
    `sites/${id}`,
    'brand',
    'packages/cms-core',
    `fixtures/${id}`,
    'package.json',
    'package-lock.json',
    extraIgnore,
  ]
    .filter(Boolean)
    .join(' ');
  return `
[build]
  command = "npm ci"
  publish = "sites/${id}/dist"
  ignore = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- ${ignore}"
`;
}

describe('parseIgnorePaths', () => {
  it('takes paths after the standalone --, not --quiet', () => {
    expect(
      parseIgnorePaths(
        'git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- sites/one brand',
      ),
    ).toEqual(['sites/one', 'brand']);
  });

  it('rejects an ignore command with no path list', () => {
    expect(() => parseIgnorePaths('git diff --quiet A B')).toThrow(/after --/);
  });
});

describe('checkSiteNetlifyToml', () => {
  it('accepts One’s committed toml', () => {
    const text = readFileSync(join(repoRoot, 'sites/one/netlify.toml'), 'utf8');
    const one = site(twoSiteCatalog, 'one');
    expect(() => checkSiteNetlifyToml(text, one, twoSiteCatalog)).not.toThrow();
    expect(requiredIgnorePaths(one)).toContain('fixtures/one');
  });

  it('accepts a Two toml that does not list One’s tree', () => {
    expect(() =>
      checkSiteNetlifyToml(toml('two'), site(twoSiteCatalog, 'two'), twoSiteCatalog),
    ).not.toThrow();
  });

  it('rejects a Two ignore list that would rebuild One', () => {
    expect(() =>
      checkSiteNetlifyToml(
        toml('two', 'sites/one'),
        site(twoSiteCatalog, 'two'),
        twoSiteCatalog,
      ),
    ).toThrow(/must not include one/);
  });

  it('rejects a missing shared input on the ignore list', () => {
    const missingBrand = toml('one').replace(' brand', '');
    expect(() =>
      checkSiteNetlifyToml(missingBrand, site(twoSiteCatalog, 'one'), twoSiteCatalog),
    ).toThrow(/must include brand/);
  });

  it('rejects a publish dir that is not this site’s dist', () => {
    const wrong = toml('one').replace('sites/one/dist', 'sites/two/dist');
    expect(() =>
      checkSiteNetlifyToml(wrong, site(twoSiteCatalog, 'one'), twoSiteCatalog),
    ).toThrow(/publish must be sites\/one\/dist/);
  });
});
