import { join } from 'node:path';
import { readCatalog } from './catalog.ts';
import { readContentMap, checkContentMap } from './content-map.ts';
import { checkOverlayPages, formatOverlayIssues } from './overlay.ts';
import { checkCatalogNetlify } from './netlify.ts';
import { resolveSource, isProductionPublish, type ResolvedSource } from './source.ts';

export interface SiteCheck {
  id: string;
  mode: ResolvedSource['mode'];
  pin: string;
  pages: Record<string, string[]>;
}

export async function checkAllSites(repoRoot: string): Promise<SiteCheck[]> {
  const catalog = readCatalog(join(repoRoot, 'sites/catalog.yaml'));
  checkCatalogNetlify(repoRoot, catalog);
  const results: SiteCheck[] = [];
  for (const site of catalog.sites) {
    const siteDir = join(repoRoot, site.directory);
    const map = readContentMap(join(siteDir, 'content-map.yaml'));
    const source = await resolveSource({ repoRoot, siteId: site.id });
    const { pages } = checkContentMap(map, source.treeFiles);
    const overlay = await checkOverlayPages(siteDir, map);
    if (overlay.issues.length > 0) {
      throw new Error(`overlay quality (${site.id}):\n${formatOverlayIssues(overlay.issues)}`);
    }
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
