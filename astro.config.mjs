// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  site: 'https://beyondjogjatours.com',
  output: 'server',
  adapter: vercel({
    isr: {
      expiration: 60,
      exclude: ['/admin', '/admin/*', '/api/*']
    }
  }),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  integrations: [tailwind()]
});
