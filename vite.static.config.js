import { defineConfig } from 'vite';

// Static HTML + CSS + a prebundled script: no application server is required.
export default defineConfig({
  server: { host: '127.0.0.1', port: 5173 },
  publicDir: 'public',
});
