import { describe, expect, it } from 'vitest';
import { parseContentMap, checkContentMap } from '../src/content-map.ts';
import { isForbiddenSource } from '../src/ignore.ts';

const yaml = `
pages:
  /:
    sources: [README.md, docs/glossary.md]
    include: false
  /install:
    sources: [docs/self-host.md]
  /modules:
    sources: [docs/modules/*.md]
`;

describe('forbidden sources', () => {
  it('flags playbooks, backlog, agents, cursor, sdk docs', () => {
    expect(isForbiddenSource('AGENTS.md')).toBe(true);
    expect(isForbiddenSource('docs/AGENTS.md')).toBe(true);
    expect(isForbiddenSource('backlog/BP-067-public-docs-site.md')).toBe(true);
    expect(isForbiddenSource('docs/architecture/public-docs-site-build-plan.md')).toBe(true);
    expect(isForbiddenSource('docs/architecture/agent-public-docs-playbook.md')).toBe(true);
    expect(isForbiddenSource('.cursor/agents/x.md')).toBe(true);
    expect(isForbiddenSource('sdk/js/docs/readme.md')).toBe(true);
    expect(isForbiddenSource('docs/self-host.md')).toBe(false);
    expect(isForbiddenSource('docs/adr/025-api-revision-versioning.md')).toBe(false);
  });
});

describe('content map', () => {
  const map = parseContentMap(yaml);
  const tree = [
    'README.md',
    'docs/glossary.md',
    'docs/self-host.md',
    'docs/modules/README.md',
    'docs/modules/core.md',
    'docs/architecture/foo-build-plan.md',
  ];

  it('expands globs and keeps include:false', () => {
    const { pages } = checkContentMap(map, tree);
    expect(map.pages['/'].include).toBe(false);
    expect(pages['/install']).toEqual(['docs/self-host.md']);
    expect(pages['/modules']).toEqual(['docs/modules/README.md', 'docs/modules/core.md']);
  });

  it('fails when a mapped path is missing at the pin', () => {
    expect(() => checkContentMap(map, ['README.md'])).toThrow(/matched no files/);
  });

  it('fails when a forbidden path is mapped', () => {
    const bad = parseContentMap(`
pages:
  /secret:
    sources: [docs/architecture/foo-build-plan.md]
`);
    expect(() => checkContentMap(bad, tree)).toThrow(/forbidden source/);
  });
});
