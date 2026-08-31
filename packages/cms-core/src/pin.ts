import { readFileSync } from 'node:fs';

export type Pin =
  | { kind: 'unset' }
  | { kind: 'tag'; value: string }
  | { kind: 'sha'; value: string };

const TAG = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const SHA = /^[0-9a-f]{7,40}$/;

/** Parse a pin file. Comments (`#`) and blank lines are ignored. */
export function parsePin(text: string): Pin {
  const tokens = text
    .split('\n')
    .map((line) => line.replace(/#.*$/, '').trim())
    .filter(Boolean);

  if (tokens.length === 0 || (tokens.length === 1 && tokens[0] === 'unset')) {
    return { kind: 'unset' };
  }
  if (tokens.length !== 1) {
    throw new Error(`pin file must contain a single value, got ${tokens.length} tokens`);
  }
  const value = tokens[0];
  if (value === 'main' || value === 'HEAD' || value === 'origin/main') {
    throw new Error(`pin must not be ${value}; One production follows a v* tag, never trunk`);
  }
  if (TAG.test(value)) return { kind: 'tag', value };
  if (SHA.test(value)) return { kind: 'sha', value };
  throw new Error(`unrecognized pin value: ${value}`);
}

export function readPinFile(path: string): Pin {
  return parsePin(readFileSync(path, 'utf8'));
}

export function pinRef(pin: Pin): string | null {
  if (pin.kind === 'unset') return null;
  return pin.value;
}
