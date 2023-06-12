import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // dev only source maps for now
    sourcemap: process.env.VITE_NODE_ENV === 'develop',
  },
  plugins: [
    svgr(),
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),

    ...(process.env.VITE_NODE_ENV === 'develop'
      ? [
          sentryVitePlugin({
            org: process.env.VITE_SENTRY_ORG,
            project: process.env.VITE_SENTRY_PROJECT,
            ignore: ['node_modules', 'vite.config.ts'],
            authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
            // TODO: enable when generating source maps
            sourcemaps: {
              assets: './dist/**',
            },
            release: process.env.VITE_SENTRY_RELEASE,
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
});
