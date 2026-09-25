import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({ plugins: [react(), tailwindcss(), VitePWA({ registerType: 'autoUpdate', workbox: { globPatterns: ['**/*.{js,css,html,woff,woff2,png,svg,webmanifest}'] }, includeAssets: ['icon.svg', 'apple-touch-icon.png'], manifest: { name: 'Times tables', short_name: 'Times tables', description: 'A little practice, a lot of fun.', theme_color: '#f8f7f3', background_color: '#f8f7f3', display: 'standalone', start_url: '/', icons: [{src:'/icon-192.png', sizes:'192x192', type:'image/png'}, {src:'/icon-512.png', sizes:'512x512', type:'image/png', purpose:'any maskable'}] } })] });
