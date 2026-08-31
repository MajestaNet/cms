export const SKIP_REASONS = [
  'docs-only',
  'no-mapped-paths',
  'duplicate',
  'cms-update-label',
] as const;

export type SkipReason = (typeof SKIP_REASONS)[number];
export type NotifyKind = 'merge' | 'tag';

export interface NotifyPayload {
  source: string;
  kind: NotifyKind;
  ref: string;
  sha: string;
  base: string;
  merged_pr: number | null;
  skip: boolean;
  skip_reason: SkipReason | null;
  paths: string[];
}

const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SHA = /^[0-9a-f]{7,40}$/;

export function parseNotify(input: unknown): NotifyPayload {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error('notify payload is not valid JSON');
    }
    return parseNotify(parsed);
  }
  if (!input || typeof input !== 'object') {
    throw new Error('notify payload must be an object');
  }
  const o = input as Record<string, unknown>;
  if (typeof o.source !== 'string' || !REPO.test(o.source)) {
    throw new Error('notify.source must be owner/repo');
  }
  if (o.source === 'MajestaNet/ide') {
    throw new Error('notify.source MajestaNet/ide is retired; use MajestaNet/one');
  }
  if (o.kind !== 'merge' && o.kind !== 'tag') {
    throw new Error('notify.kind must be merge or tag');
  }
  if (typeof o.ref !== 'string' || o.ref.length === 0) {
    throw new Error('notify.ref is required');
  }
  if (typeof o.sha !== 'string' || !SHA.test(o.sha)) {
    throw new Error('notify.sha must be a git object name');
  }
  const base = o.base == null ? '' : String(o.base);
  let merged_pr: number | null = null;
  if (o.merged_pr != null) {
    if (typeof o.merged_pr !== 'number' || !Number.isInteger(o.merged_pr)) {
      throw new Error('notify.merged_pr must be an integer or null');
    }
    merged_pr = o.merged_pr;
  }
  if (typeof o.skip !== 'boolean') {
    throw new Error('notify.skip must be a boolean');
  }
  let skip_reason: SkipReason | null = null;
  if (o.skip_reason != null) {
    if (typeof o.skip_reason !== 'string' || !SKIP_REASONS.includes(o.skip_reason as SkipReason)) {
      throw new Error(`notify.skip_reason must be one of ${SKIP_REASONS.join(', ')}`);
    }
    skip_reason = o.skip_reason as SkipReason;
  }
  if (!Array.isArray(o.paths) || o.paths.some((p) => typeof p !== 'string')) {
    throw new Error('notify.paths must be an array of strings');
  }
  const paths = o.paths as string[];
  for (const p of paths) {
    if (p.includes('\\') || p.startsWith('/') || p.split('/').includes('..')) {
      throw new Error(`notify.paths entries must be repo-relative forward-slash paths: ${p}`);
    }
  }
  return {
    source: o.source,
    kind: o.kind,
    ref: o.ref,
    sha: o.sha,
    base,
    merged_pr,
    skip: o.skip,
    skip_reason,
    paths,
  };
}

export type RouteResult =
  | { action: 'skip'; reason: SkipReason | 'skip-flag' }
  | { action: 'unknown-source'; source: string }
  | { action: 'update'; siteId: string; kind: NotifyKind };

import type { Catalog } from './catalog.ts';
import { siteBySource } from './catalog.ts';

export function routeNotify(payload: NotifyPayload, catalog: Catalog): RouteResult {
  if (payload.skip) {
    return { action: 'skip', reason: payload.skip_reason ?? 'skip-flag' };
  }
  const site = siteBySource(catalog, payload.source);
  if (!site) {
    return { action: 'unknown-source', source: payload.source };
  }
  return { action: 'update', siteId: site.id, kind: payload.kind };
}
