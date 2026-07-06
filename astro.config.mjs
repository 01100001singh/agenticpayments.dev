import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://agenticpayments.dev',
  integrations: [mdx()],
  build: {
    format: 'directory',
  },
});
