import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '127.0.0.1', // hanya localhost, tidak expose ke jaringan lokal
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            rewrite: (path) => path,
          }
        }
      },
      plugins: [react()],
      // SECURITY: Jangan expose API keys ke client-side bundle.
      // Jika butuh Gemini AI, panggil melalui backend (proxy), bukan langsung dari frontend.
      define: {},
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'src': path.resolve(__dirname, '.'),
        }
      }
    };
});
