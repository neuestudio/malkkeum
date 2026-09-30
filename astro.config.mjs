import { defineConfig } from 'astro/config';
import site from './site.config.mjs';

export default defineConfig({
  site: site.SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
