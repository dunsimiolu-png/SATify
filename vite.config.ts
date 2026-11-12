import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { authApiPlugin } from './server/authPlugin';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), authApiPlugin()],
    base: './',
    build: {
      emptyOutDir: false
    },
    server: {
      port: 5173,
      host: '127.0.0.1'
    }
  };
});
