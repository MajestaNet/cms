import { describe, expect, it } from 'vitest';
import { parseCatalog, siteBySource } from '../src/catalog.ts';

const sample = `
sites:
  - id: one
    source_repo: MajestaNet/one
    directory: sites/one
    hostname: one.majesta.net
    netlify_site: majesta-one-docs
    agent: sites/one/AGENT.md
    production_pin: tag-v
    pin_file: sites/one/pin
`;

describe('catalog', () => {
  it('parses a site and looks up by source', () => {
    const catalog = parseCatalog(sample);
    expect(catalog.sites).toHaveLength(1);
    expect(siteBySource(catalog, 'MajestaNet/one')?.id).toBe('one');
    expect(siteBySource(catalog, 'MajestaNet/two')).toBeUndefined();
    expect(siteBySource(catalog, 'MajestaNet/ide')).toBeUndefined();
  });

  it('rejects the retired ide source name', () => {
    const bad = sample.replace('MajestaNet/one', 'MajestaNet/ide');
    expect(() => parseCatalog(bad)).toThrow(/ide/);
  });

  it('rejects duplicate ids', () => {
    const dup = `${sample}
  - id: one
    source_repo: MajestaNet/other
    directory: sites/other
    hostname: other.majesta.net
    netlify_site: other
    agent: sites/other/AGENT.md
    production_pin: main
    pin_file: sites/other/pin
`;
    expect(() => parseCatalog(dup)).toThrow(/duplicate catalog id/);
  });

  it('rejects duplicate hostname and netlify_site (second product is a new site)', () => {
    const two = `
  - id: two
    source_repo: MajestaNet/two
    directory: sites/two
    hostname: two.majesta.net
    netlify_site: majesta-two-docs
    agent: sites/two/AGENT.md
    production_pin: main
    pin_file: sites/two/pin
`;
    expect(() => parseCatalog(sample + two)).not.toThrow();
    expect(() =>
      parseCatalog(sample + two.replace('two.majesta.net', 'one.majesta.net')),
    ).toThrow(/duplicate catalog hostname/);
    expect(() =>
      parseCatalog(sample + two.replace('majesta-two-docs', 'majesta-one-docs')),
    ).toThrow(/duplicate catalog netlify_site/);
  });

  it('rejects registering the template directory', () => {
    const bad = sample
      .replace('id: one', 'id: _template')
      .replace('directory: sites/one', 'directory: sites/_template');
    expect(() => parseCatalog(bad)).toThrow(/_template/);
  });
});
