// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://knowpsyche.com',
  trailingSlash: 'always',
  output: 'static',

  vite: {
    plugins: [tailwindcss()]
  },

  // /report/ is personal and noindex, so it stays out of the sitemap.
  integrations: [sitemap({ filter: (page) => !page.includes('/report/') })]
});
