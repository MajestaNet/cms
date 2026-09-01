import { describe, expect, it } from 'vitest';
import { isLivePublish, isProductionPublish } from '../src/source.ts';

describe('isProductionPublish', () => {
  it('is true only for an explicit CMS_PRODUCTION opt-in or live Netlify production', () => {
    expect(isProductionPublish({ CMS_PRODUCTION: '1' })).toBe(true);
    expect(isProductionPublish({ CONTEXT: 'production' })).toBe(true);
    expect(isProductionPublish({ NETLIFY_CONTEXT: 'production' })).toBe(true);
    expect(isProductionPublish({ CONTEXT: 'deploy-preview' })).toBe(false);
    expect(isProductionPublish({ CONTEXT: 'production', VITEST: 'true' })).toBe(false);
    expect(isProductionPublish({ CONTEXT: 'production', VITEST: 'true', CMS_PRODUCTION: '1' })).toBe(
      true,
    );
  });
});

describe('isLivePublish', () => {
  it('fail-closes local CMS_PRODUCTION and unknown production URL', () => {
    expect(isLivePublish({ CMS_PRODUCTION: '1' })).toBe(true);
    expect(isLivePublish({ CONTEXT: 'production' })).toBe(true);
  });

  it('allows the first Netlify *.netlify.app production deploy to use fixtures', () => {
    expect(
      isLivePublish({
        CONTEXT: 'production',
        URL: 'https://majesta-one-docs.netlify.app',
      }),
    ).toBe(false);
  });

  it('fail-closes once a product hostname is the primary URL', () => {
    expect(
      isLivePublish({
        CONTEXT: 'production',
        URL: 'https://one.majesta.net',
      }),
    ).toBe(true);
    expect(
      isLivePublish({
        CONTEXT: 'production',
        URL: 'https://two.majesta.net/',
      }),
    ).toBe(true);
  });

  it('does not treat Deploy Previews as live', () => {
    expect(
      isLivePublish({
        CONTEXT: 'deploy-preview',
        URL: 'https://deploy-preview-4--majesta-one-docs.netlify.app',
      }),
    ).toBe(false);
  });

  it('ignores Netlify CONTEXT inside Vitest unless CMS_PRODUCTION=1', () => {
    expect(isLivePublish({ CONTEXT: 'production', VITEST: 'true' })).toBe(false);
    expect(isLivePublish({ CONTEXT: 'production', VITEST: 'true', CMS_PRODUCTION: '1' })).toBe(
      true,
    );
  });
});
