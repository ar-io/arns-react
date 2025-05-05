import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/

export default defineConfig({
  base: '',
  esbuild: false,
  build: {
    sourcemap: true,
    minify: true,
    cssMinify: true,
  },
  plugins: [
    svgr(),
    react(),
    nodePolyfills(),
    // if we are building for permaweb deploy we dont want sentry
    ...(process.env.VITE_NODE_ENV && !process.env.VITE_ARNS_NAME
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
