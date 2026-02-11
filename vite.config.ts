import path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
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
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
    exclude: ['@base-org/account'],
  },
  plugins: [
    svgr(),
    react(),
    nodePolyfills(),
    // if we are building for permaweb deploy we dont want sentry
    ...(process.env.VITE_SENTRY_ENABLED === 'true' &&
    process.env.VITE_NODE_ENV &&
    !process.env.VITE_ARNS_NAME
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
      '@src': path.resolve(__dirname) + '/src',
      // Force all @solana/codecs-core to use root copy (5.1.0 has bytesEqual); nested copies are 5.0.0 and break the build
      '@solana/codecs-core': path.resolve(
        __dirname,
        'node_modules/@solana/codecs-core',
      ),
    },
  },
});
