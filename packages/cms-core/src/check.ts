import { join } from 'node:path';
import { readCatalog } from './catalog.ts';
import { readContentMap, checkContentMap } from './content-map.ts';
import { resolveSource, isProductionPublish, type ResolvedSource } from './source.ts';

export interface SiteCheck {
  id: string;
  mode: ResolvedSource['mode'];
  pin: string;
  pages: Record<string, string[]>;
}

export async function checkAllSites(repoRoot: string): Promise<SiteCheck[]> {
  const catalog = readCatalog(join(repoRoot, 'sites/catalog.yaml'));
  const results: SiteCheck[] = [];
  for (const site of catalog.sites) {
    const map = readContentMap(join(repoRoot, site.directory, 'content-map.yaml'));
    const source = await resolveSource({ repoRoot, siteId: site.id });
    const { pages } = checkContentMap(map, source.treeFiles);
    results.push({
      id: site.id,
      mode: source.mode,
      pin: source.pin.kind === 'unset' ? 'unset' : source.pin.value,
      pages,
    });
  }
  return results;
}

export { isProductionPublish };
