import { minimatch } from 'minimatch';

/** Source paths that must never appear on a content map. */
export const FORBIDDEN_SOURCE_GLOBS = [
  '**/AGENTS.md',
  '**/.cursor/**',
  '**/backlog/**',
  '**/*-build-plan.md',
  '**/*-playbook*',
  '**/sdk/**/docs/**',
] as const;

export function isForbiddenSource(path: string): boolean {
  const normalized = path.replace(/\\/g, '/');
  return FORBIDDEN_SOURCE_GLOBS.some((g) => minimatch(normalized, g, { dot: true, nocase: false }));
}
