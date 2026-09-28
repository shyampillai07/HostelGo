import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true }, 
      manifest: {
        name: 'HostelGo',
        short_name: 'HostelGo',
        description: 'Digital hostel pass and access management — VTU PG Centre, Mysuru',
        theme_color: '#1B2A4A',
        background_color: '#F7F2E7',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
});