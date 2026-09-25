import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Relative base: the same build works on Hostinger (root) and GitHub Pages (/kuyaypet/).
  base: './',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'img/**/*'],
      manifest: {
        name: 'KuyayPet — Adopta · Conecta · Transforma',
        short_name: 'KuyayPet',
        description: 'Encuentra a tu compañero ideal: adopción de mascotas en Lima con match por compatibilidad.',
        lang: 'es-PE',
        theme_color: '#B5553A',
        background_color: '#FFF8EE',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,json}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // The demo manual is a separate static page, never the SPA shell.
        navigateFallbackDenylist: [/\/manual\//],
      },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
