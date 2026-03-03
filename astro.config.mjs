import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://vinhnguyenba.dev',
  output: 'static',

  build: {
    format: 'file',
  },

  trailingSlash: 'never',
  integrations: [mdx(), sitemap()],
});