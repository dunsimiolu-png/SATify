import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { authApiPlugin } from './server/authPlugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), authApiPlugin()],
  base: './',
  server: {
    port: 5173,
    host: '127.0.0.1'
  }
});
