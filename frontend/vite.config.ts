import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 80,
    strictPort: true,
    host: true,
    allowedHosts: ['kiosco.correos'],
    proxy: {
      '/api': 'http://localhost:3002',
      '/socket.io': {
        target: 'http://localhost:3002',
        ws: true,
      },
    },
  },
});

