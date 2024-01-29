import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    minify: true,
    cssMinify: true,
  },
  plugins: [
    svgr(),
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
    ...(process.env.VITE_NODE_ENV
      ? [
          sentryVitePlugin({
            org: process.env.VITE_SENTRY_ORG,
            project: process.env.VITE_SENTRY_PROJECT,
            ignore: ['node_modules', 'vite.config.ts'],
            authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
            sourcemaps: {
              assets: './dist/**',
            },
            release: process.env.VITE_SENTRY_RELEASE,
            deploy: {
              env: process.env.VITE_NODE_ENV,
            },
          }),
        ]
      : []),
  ],
  base: '/',
  define: {
    'process.env': process.env,
    VITE_CONFIG: {
      version: JSON.stringify(process.env.npm_package_version),
    },
  },
  // required for warp-contracts
  optimizeDeps: {
    exclude: ['vm2'],
  },
  resolve: {
    alias: {
      '@tests': path.resolve(__dirname) + '/tests',
      '@src': path.resolve(__dirname) + '/src',
    },
  },
});
