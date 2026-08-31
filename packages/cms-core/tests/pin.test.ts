import { describe, expect, it } from 'vitest';
import { parsePin } from '../src/pin.ts';

describe('parsePin', () => {
  it('treats comments-only and unset as unset', () => {
    expect(parsePin('# Production pin\nunset\n')).toEqual({ kind: 'unset' });
    expect(parsePin('')).toEqual({ kind: 'unset' });
    expect(parsePin('# only\n')).toEqual({ kind: 'unset' });
  });

  it('accepts a v* tag', () => {
    expect(parsePin('v0.1.0\n')).toEqual({ kind: 'tag', value: 'v0.1.0' });
    expect(parsePin('v1.2.3-rc.1')).toEqual({ kind: 'tag', value: 'v1.2.3-rc.1' });
  });

  it('accepts a git sha', () => {
    expect(parsePin('deadbeef')).toEqual({ kind: 'sha', value: 'deadbeef' });
    expect(parsePin('0123456789abcdef0123456789abcdef01234567')).toEqual({
      kind: 'sha',
      value: '0123456789abcdef0123456789abcdef01234567',
    });
  });

  it('rejects trunk names', () => {
    expect(() => parsePin('main')).toThrow(/never trunk/);
    expect(() => parsePin('HEAD')).toThrow(/never trunk/);
    expect(() => parsePin('origin/main')).toThrow(/never trunk/);
  });

  it('rejects junk', () => {
    expect(() => parsePin('latest')).toThrow(/unrecognized/);
    expect(() => parsePin('v0.1.0\nv0.2.0')).toThrow(/single value/);
  });
});
