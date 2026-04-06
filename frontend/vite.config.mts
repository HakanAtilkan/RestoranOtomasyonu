import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // Modern + legacy chunk: eski tarayıcılar için transpile + polyfill
      targets: [
        'defaults',
        'not IE 11',
        'Safari >= 14',
        'iOS >= 14',
        'Chrome >= 80',
        'Firefox >= 78',
        'Edge >= 88'
      ],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.symbol',
        'es.promise',
        'es.promise.finally',
        'es/map',
        'es/set',
        'es.array.flat',
        'es.array.flat-map',
        'es.object.assign'
      ],
      modernPolyfills: true
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
});

