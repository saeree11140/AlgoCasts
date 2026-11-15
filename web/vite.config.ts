import { defineConfig } from 'vite';
export default defineConfig({
  server: { port: 5173, strictPort: true },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 4000,
    // Keep font files as real assets: the production CSP allows `font-src 'self'`, not data: URIs.
    assetsInlineLimit: (file) => (/\.(woff2?|ttf|otf)$/.test(file) ? false : undefined),
  },
});
