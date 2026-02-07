import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vinhnguyenba.dev',
  output: 'static',
  build: {
    format: 'file',
  },
  trailingSlash: 'never',
});
