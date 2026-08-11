import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  esbuild: false,
  server: {
    // Allow tunnelled dev hosts (ngrok rotates the subdomain every session).
    // The leading dot is Vite's wildcard for "any subdomain of this domain".
    // Localhost variants are accepted by default; listed here for clarity.
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok-free.app',
      '.ngrok.app',
      '.ngrok.io',
    ],
  },
  build: {
    sourcemap: true,
    minify: true,
    cssMinify: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
    include: ['@ar.io/sdk', '@ar.io/sdk/web'],
    exclude: ['@base-org/account'],
  },
  plugins: [svgr(), react(), nodePolyfills()],
  define: {
    __NPM_PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
    'process.env': {
      // DO NOT EXPOSE THE ENTIRE process.env HERE - sensitive information on CI/CD could be exposed.
      URL: process.env.URL,
    },
  },
  resolve: {
    alias: {
      '@tests': path.resolve(__dirname) + '/tests',
      '@src': path.resolve(__dirname) + '/src',
    },
  },
});
