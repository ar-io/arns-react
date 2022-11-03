import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // TODO: remove this when no longer deploying to GH pages
  base: '/arns-react/'
});
