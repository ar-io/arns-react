import fs from 'fs';
import path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';
import svgr from 'vite-plugin-svgr';

/**
 * Dependency-blocker fix (Turbo-ArNS integration).
 *
 * `@ardrive/turbo-sdk` → `@solana/spl-token` pulls in
 * `@solana/spl-token-metadata@0.1.6`, which imports `getDataEnumCodec` from
 * `@solana/codecs@2.0.0-rc.1`. This repo's root `resolutions` force the whole
 * `@solana/*` codecs family to `6.8.0`, where that helper was renamed
 * `getDataEnumCodec` → `getDiscriminatedUnionCodec` (a pure rename, same
 * signature). With the broad `"@solana/codecs": "6.8.0"` pin present, Yarn 1
 * classic collapses any scoped/nested override back onto `6.8.0`, so the two
 * majors cannot coexist as nested deps here — leaving Rollup to fail the build
 * with: `"getDataEnumCodec" is not exported by @solana/codecs`.
 *
 * This plugin rewrites that single renamed identifier ONLY inside
 * `@solana/spl-token-metadata`, so the module binds against the installed
 * 6.8.0 codecs. Scoped by module id, it never touches the app's or any other
 * package's `@solana/codecs` usage.
 *
 * Follow-up (not done here): the turbo-sdk should either widen its Solana
 * codecs peer range / align `@solana/spl-token` to a codecs-6.x-compatible
 * release, or vendor an spl-token build that doesn't drag in the rc.1 codecs —
 * which would remove the need for this shim in every consumer.
 */
function patchSplTokenMetadataCodecs() {
  return {
    name: 'patch-spl-token-metadata-codecs',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (
        id.includes('@solana/spl-token-metadata') &&
        code.includes('getDataEnumCodec')
      ) {
        return {
          code: code.replace(/getDataEnumCodec/g, 'getDiscriminatedUnionCodec'),
          map: null,
        };
      }
      return null;
    },
  };
}

/**
 * Dev-server counterpart of `patchSplTokenMetadataCodecs`.
 *
 * The Rollup `transform` plugin above only runs during `vite build`. In dev,
 * Vite pre-bundles dependencies with **esbuild** (optimizeDeps), which never
 * sees that plugin — so `yarn dev` would still crash with
 * `No matching export ... for import "getDataEnumCodec"`. This esbuild `onLoad`
 * hook applies the same identifier rename while esbuild optimizes
 * `@solana/spl-token-metadata`, so dev and build both work.
 */
const patchSplTokenMetadataCodecsEsbuild = {
  name: 'patch-spl-token-metadata-codecs-esbuild',
  setup(build: {
    onLoad: (
      opts: { filter: RegExp },
      cb: (args: { path: string }) => { contents: string; loader: 'js' },
    ) => void;
  }) {
    build.onLoad(
      { filter: /@solana[\\/]spl-token-metadata[\\/].*\.js$/ },
      (args) => {
        const src = fs.readFileSync(args.path, 'utf8');
        return {
          contents: src.includes('getDataEnumCodec')
            ? src.replace(/getDataEnumCodec/g, 'getDiscriminatedUnionCodec')
            : src,
          loader: 'js' as const,
        };
      },
    );
  },
};

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
      plugins: [patchSplTokenMetadataCodecsEsbuild],
    },
    include: ['@ar.io/sdk', '@ar.io/sdk/web'],
    exclude: ['@base-org/account'],
  },
  plugins: [
    patchSplTokenMetadataCodecs(),
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
      '@tests': path.resolve(__dirname) + '/tests',
      '@src': path.resolve(__dirname) + '/src',
    },
  },
});
