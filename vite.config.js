import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cpSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  build: { rollupOptions: { input: { main: resolve('index.html'), indicacoes: resolve('indicacoes/index.html'), indicacoesLegado: resolve('indicacoes.html'), organizacao: resolve('organizacao/index.html') } } },
  server: { proxy: { '/api': { target: 'http://127.0.0.1:4175', changeOrigin: false, configure(proxy) { proxy.on('proxyReq', (proxyReq, req) => proxyReq.setHeader('host', req.headers.host)); } } } },
  plugins: [react(), tailwindcss(), {
    name: 'copy-resenha-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        let pathname;
        try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.statusCode = 400; res.end(); return; }
        if (/^\/data(?:\/|$)/i.test(pathname) || /\.(?:sqlite|sqlite3|db)(?:-(?:wal|shm))?$/i.test(pathname)) { res.statusCode = 403; res.end('Forbidden'); return; }
        next();
      });
    },
    closeBundle() {
      cpSync(resolve('assets'), resolve('dist/assets'), { recursive: true });
    },
  }],
});
