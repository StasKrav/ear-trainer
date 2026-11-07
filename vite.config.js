import { defineConfig } from 'vite';

export default defineConfig({
  base: './',        // относительные пути — удобно для GitHub Pages
  build: {
    target: 'es2020',
  },
});