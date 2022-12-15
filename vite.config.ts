import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svgr(), react()],
  // TODO: remove this when no longer deploying to GH pages
  base: '/arns-react/',
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  // required for warp-contracts
  optimizeDeps: {
    exclude: ['vm2'],
  },
});
