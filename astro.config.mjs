// @ts-check
import { defineConfig } from 'astro/config';
import fetchPfp from './scripts/fetch-pfp.mjs';

// Fetch the profile picture before Astro does its thing.
await fetchPfp();

// https://astro.build/config
export default defineConfig({
  vite: {
    define: {
      'import.meta.env.BUILD_TIMESTAMP': JSON.stringify(new Date().toISOString()),
    }
  }
});
