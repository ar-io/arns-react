// vite.config.ts
import { sentryVitePlugin } from 'file:///C:/Users/theod/Documents/code/1%20-%20work/ar-io/arns-react/node_modules/@sentry/vite-plugin/dist/esm/index.mjs';
import react from 'file:///C:/Users/theod/Documents/code/1%20-%20work/ar-io/arns-react/node_modules/@vitejs/plugin-react/dist/index.mjs';
import { nodePolyfills } from 'file:///C:/Users/theod/Documents/code/1%20-%20work/ar-io/arns-react/node_modules/vite-plugin-node-polyfills/dist/index.js';
import svgr from 'file:///C:/Users/theod/Documents/code/1%20-%20work/ar-io/arns-react/node_modules/vite-plugin-svgr/dist/index.mjs';
import { defineConfig } from 'file:///C:/Users/theod/Documents/code/1%20-%20work/ar-io/arns-react/node_modules/vite/dist/node/index.js';

var vite_config_default = defineConfig({
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
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx0aGVvZFxcXFxEb2N1bWVudHNcXFxcY29kZVxcXFwxIC0gd29ya1xcXFxhci1pb1xcXFxhcm5zLXJlYWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx0aGVvZFxcXFxEb2N1bWVudHNcXFxcY29kZVxcXFwxIC0gd29ya1xcXFxhci1pb1xcXFxhcm5zLXJlYWN0XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy90aGVvZC9Eb2N1bWVudHMvY29kZS8xJTIwLSUyMHdvcmsvYXItaW8vYXJucy1yZWFjdC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IHNlbnRyeVZpdGVQbHVnaW4gfSBmcm9tICdAc2VudHJ5L3ZpdGUtcGx1Z2luJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscyc7XG5pbXBvcnQgc3ZnciBmcm9tICd2aXRlLXBsdWdpbi1zdmdyJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJ1aWxkOiB7XG4gICAgLy8gZGV2IG9ubHkgc291cmNlIG1hcHMgZm9yIG5vd1xuICAgIHNvdXJjZW1hcDogcHJvY2Vzcy5lbnYuVklURV9OT0RFX0VOViA9PT0gJ2RldmVsb3AnLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgc3ZncigpLFxuICAgIHJlYWN0KCksXG4gICAgbm9kZVBvbHlmaWxscyh7XG4gICAgICAvLyBXaGV0aGVyIHRvIHBvbHlmaWxsIGBub2RlOmAgcHJvdG9jb2wgaW1wb3J0cy5cbiAgICAgIHByb3RvY29sSW1wb3J0czogdHJ1ZSxcbiAgICB9KSxcblxuICAgIC4uLihwcm9jZXNzLmVudi5WSVRFX05PREVfRU5WID09PSAnZGV2ZWxvcCdcbiAgICAgID8gW1xuICAgICAgICAgIHNlbnRyeVZpdGVQbHVnaW4oe1xuICAgICAgICAgICAgb3JnOiBwcm9jZXNzLmVudi5WSVRFX1NFTlRSWV9PUkcsXG4gICAgICAgICAgICBwcm9qZWN0OiBwcm9jZXNzLmVudi5WSVRFX1NFTlRSWV9QUk9KRUNULFxuICAgICAgICAgICAgaWdub3JlOiBbJ25vZGVfbW9kdWxlcycsICd2aXRlLmNvbmZpZy50cyddLFxuICAgICAgICAgICAgYXV0aFRva2VuOiBwcm9jZXNzLmVudi5WSVRFX1NFTlRSWV9BVVRIX1RPS0VOLFxuICAgICAgICAgICAgLy8gVE9ETzogZW5hYmxlIHdoZW4gZ2VuZXJhdGluZyBzb3VyY2UgbWFwc1xuICAgICAgICAgICAgc291cmNlbWFwczoge1xuICAgICAgICAgICAgICBhc3NldHM6ICcuL2Rpc3QvKionLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlbGVhc2U6IHByb2Nlc3MuZW52LlZJVEVfU0VOVFJZX1JFTEVBU0UsXG4gICAgICAgICAgfSksXG4gICAgICAgIF1cbiAgICAgIDogW10pLFxuICBdLFxuICBiYXNlOiAnLycsXG4gIGRlZmluZToge1xuICAgICdwcm9jZXNzLmVudic6IHByb2Nlc3MuZW52LFxuICAgIFZJVEVfQ09ORklHOiB7XG4gICAgICB2ZXJzaW9uOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uKSxcbiAgICB9LFxuICB9LFxuICAvLyByZXF1aXJlZCBmb3Igd2FycC1jb250cmFjdHNcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWyd2bTInXSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyVyxTQUFTLHdCQUF3QjtBQUM1WSxPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxVQUFVO0FBR2pCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE9BQU87QUFBQTtBQUFBLElBRUwsV0FBVyxRQUFRLElBQUksa0JBQWtCO0FBQUEsRUFDM0M7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFBQTtBQUFBLE1BRVosaUJBQWlCO0FBQUEsSUFDbkIsQ0FBQztBQUFBLElBRUQsR0FBSSxRQUFRLElBQUksa0JBQWtCLFlBQzlCO0FBQUEsTUFDRSxpQkFBaUI7QUFBQSxRQUNmLEtBQUssUUFBUSxJQUFJO0FBQUEsUUFDakIsU0FBUyxRQUFRLElBQUk7QUFBQSxRQUNyQixRQUFRLENBQUMsZ0JBQWdCLGdCQUFnQjtBQUFBLFFBQ3pDLFdBQVcsUUFBUSxJQUFJO0FBQUE7QUFBQSxRQUV2QixZQUFZO0FBQUEsVUFDVixRQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0EsU0FBUyxRQUFRLElBQUk7QUFBQSxNQUN2QixDQUFDO0FBQUEsSUFDSCxJQUNBLENBQUM7QUFBQSxFQUNQO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsSUFDTixlQUFlLFFBQVE7QUFBQSxJQUN2QixhQUFhO0FBQUEsTUFDWCxTQUFTLEtBQUssVUFBVSxRQUFRLElBQUksbUJBQW1CO0FBQUEsSUFDekQ7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUVBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxLQUFLO0FBQUEsRUFDakI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
