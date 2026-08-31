import { defineConfig, fontProviders } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFileSync, mkdirSync } from 'node:fs';
import {
  checkContentMap,
  readContentMap,
  remarkCmsSources,
  resolveSource,
} from '@majestanet/cms-core';

const siteDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(dirname(siteDir));

const source = await resolveSource({ repoRoot, siteId: 'one' });
const map = readContentMap(join(siteDir, 'content-map.yaml'));
const { pages: expanded } = checkContentMap(map, source.treeFiles);

mkdirSync(join(siteDir, 'public'), { recursive: true });
copyFileSync(join(repoRoot, 'brand/symbol-navy.svg'), join(siteDir, 'public/favicon.svg'));
copyFileSync(
  join(repoRoot, 'brand/symbol/gold-256.png'),
  join(siteDir, 'public/apple-touch-icon.png'),
);

const unpublished = source.mode !== 'pin';

export default defineConfig({
  site: 'https://one.majesta.net',
  trailingSlash: 'never',
  fonts: [
    {
      name: 'Josefin Sans',
      cssVariable: '--font-display',
      provider: fontProviders.google(),
      weights: [300, 400],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
    },
    {
      name: 'Inter',
      cssVariable: '--font-text',
      provider: fontProviders.google(),
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
    },
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkCmsSources({ source, map, expanded })],
    }),
  },
  vite: {
    define: {
      'import.meta.env.PUBLIC_CMS_SOURCE_MODE': JSON.stringify(source.mode),
    },
  },
  integrations: [
    starlight({
      title: 'Majesta One',
      description:
        'Dedicated-install API platform. Connect with MCP, the one CLI, and family HTTP.',
      logo: {
        light: '../../brand/logo-gold.svg',
        dark: '../../brand/logo-gold.svg',
        alt: 'Majesta.Net',
        replacesTitle: true,
      },
      favicon: '/favicon.svg',
      social: [
        {
          icon: 'github',
          label: 'Source on GitHub',
          href: 'https://github.com/MajestaNet/one',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/MajestaNet/cms/edit/main/sites/one/',
      },
      customCss: ['./src/styles/custom.css'],
      components: {
        ThemeSelect: './src/components/ThemeSelect.astro',
        Banner: './src/components/Banner.astro',
        Head: './src/components/Head.astro',
        Header: './src/components/Header.astro',
        Footer: './src/components/Footer.astro',
      },
      head: unpublished
        ? [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } }]
        : [],
      sidebar: [
        { label: 'Overview', link: '/' },
        { label: 'Install', slug: 'install' },
        { label: 'Connect', slug: 'connect' },
        { label: 'CLI', slug: 'cli' },
        {
          label: 'API',
          items: [
            { label: 'Families', slug: 'api/families' },
            { label: 'Revision', slug: 'api/revision' },
            { label: 'Client', slug: 'api/client' },
            { label: 'Metadata', slug: 'api/metadata' },
            { label: 'Deploy', slug: 'api/deploy' },
            { label: 'Ops', slug: 'api/ops' },
            { label: 'Auth', slug: 'api/auth' },
          ],
        },
        { label: 'Modules', slug: 'modules' },
        { label: 'Customization', slug: 'customization' },
        { label: 'Upgrades', slug: 'upgrades' },
        { label: 'Security', slug: 'security' },
        { label: 'Releases', slug: 'releases' },
      ],
    }),
  ],
});
