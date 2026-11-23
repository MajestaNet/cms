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

const source = await resolveSource({ repoRoot, siteId: 'two' });
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
  site: 'https://two.majesta.net',
  trailingSlash: 'never',
  prefetch: true,
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
      title: 'Majesta Two',
      description:
        'Local control plane for one Mac. The iPhone enrolls; the Apple Watch is push-to-talk.',
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
          href: 'https://github.com/MajestaNet/two',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/MajestaNet/cms/edit/main/sites/two/',
      },
      tableOfContents: false,
      customCss: ['./src/styles/custom.css'],
      components: {
        ThemeSelect: './src/components/ThemeSelect.astro',
        ThemeProvider: './src/components/ThemeProvider.astro',
        Banner: './src/components/Banner.astro',
        Head: './src/components/Head.astro',
        Header: './src/components/Header.astro',
        Footer: './src/components/Footer.astro',
        TwoColumnContent: './src/components/TwoColumnContent.astro',
        PageSidebar: './src/components/PageSidebar.astro',
      },
      head: unpublished
        ? [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } }]
        : [],
      sidebar: [
        { label: 'Overview', link: '/' },
        { label: 'Run on a Mac', slug: 'run' },
        { label: 'iPhone and Watch', slug: 'phone' },
        { label: 'Private edge', slug: 'edge' },
        { label: 'Devices', slug: 'devices' },
        { label: 'Console and CLI', slug: 'console' },
        { label: 'Operations', slug: 'operations' },
        { label: 'Security', slug: 'security' },
      ],
    }),
  ],
});
