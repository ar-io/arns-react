# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React app for the Ar.io Name System (ArNS) Registry — search for, purchase, and
manage ArNS names. Vite + React 18 + TypeScript + TailwindCSS.

**The backend is Solana-only.** The codebase went through a "de-AO refactor":
ArNS records and ANTs live in Solana programs (ANTs are Metaplex Core NFTs), not
in AO processes. Comments referencing "the de-AO refactor" mark code touched by
that migration. Arweave is still used for data storage/retrieval (Turbo uploads,
logo images, GraphQL), but not for contract state.

## Development Commands

```bash
yarn                  # Install
yarn dev              # Dev server (NODE_ENV=prod, VITE_GITHUB_HASH=local)
yarn build            # Production build (32GB max-old-space-size)
yarn build:production # VITE_ENVIRONMENT=production
yarn build:develop    # VITE_ENVIRONMENT=develop
yarn preview          # Preview built output

yarn test                 # Jest unit tests
yarn test:coverage        # With coverage (80% threshold: branches/functions/lines)
yarn test:updateSnapshot  # Update snapshots
yarn test:playwright      # Playwright e2e

yarn lint:check / lint:fix      # Biome (lint:fix uses --unsafe)
yarn format:check / format:fix  # Biome formatter

yarn storybook        # Storybook on :6006
yarn publish:arweave  # Build + `ario-deploy deploy --arns-name $VITE_ARNS_NAME`
```

Run a single test file:

```bash
npx cross-env NODE_ENV=test jest src/utils/searchUtils/searchUtils.test.ts
```

`NODE_ENV=test` is required — Jest uses `tsconfig.test.json` and a custom
`import.meta` AST transformer (`tests/common/import-meta-transformer.js`) to make
Vite's `import.meta.env` work under CommonJS.

Biome is the source of truth for lint/format. `.eslintrc` and `.prettierrc` are
vestigial — don't wire new tooling to them.

## Architecture

### Solana backend and SDK construction

`src/utils/solana.ts` owns the active Solana config (network, RPC URL, program
IDs, ARIO mint). Key points:

- Config is **runtime-switchable** via `setSolanaConfig()` — the Settings →
  Network page exposes `devnet` / `mainnet-beta` presets plus per-program-ID
  overrides. Switching invalidates the memoized RPC clients, so always read
  through `getActiveSolanaConfig()` / `getSolanaRpc()` /
  `getSolanaRpcSubscriptions()` rather than caching module-level constants.
- The exported `SOLANA_NETWORK` / `SOLANA_RPC_URL` / `SOLANA_PROGRAM_IDS`
  constants are the *initial* env-derived values only. Use them for bootstrap,
  not for live reads.

`src/utils/sdk-init.ts` is the chokepoint for building `@ar.io/sdk` clients:
`buildArio`, `buildArioRead`, `buildAnt`, `buildAntRead`, plus the
`isSolanaWallet()` type guard. Read paths work without a wallet (read-only
client against the configured RPC), so unauthenticated browsing keeps working.
Add new SDK instantiation here rather than calling `ARIO.init` / `ANT.init`
inline.

`isSolanaWallet()` checks *both* `tokenType === 'solana'` and a present
`solanaSigner` — Phantom attaches `signTransaction` a tick after `connected`
flips, so write helpers must fall back to read-only during that window.

### ANT ACL drift (`src/utils/aclSync.ts`)

The on-chain ANT ACL (paginated `AclConfig` / `AclPage` PDAs) is an
*eventually-consistent* index of which ANTs a wallet owns. Raw Metaplex Core
transfers move the asset immediately but do not update the ACL, so it lags in
both directions — a received name is invisible until synced, a sent name lingers.
`computeAclDrift()` establishes ground truth via a `getProgramAccounts` owner
scan against `MPL_CORE_PROGRAM_ID`, filtered by the `ANT Program` Metaplex
attribute. If names appear missing or stale in Manage, this is the first place to
look.

### Wallets — Solana only

`WALLET_TYPES` has a single member: `SOLANA`. Wallet discovery goes through
`@solana/wallet-adapter-react` using the **Wallet Standard registry** —
`main.tsx` passes `wallets={[]}` on purpose; Phantom, Solflare, Backpack, Glow
etc. self-register. Do not add legacy per-wallet adapter packages.

`autoConnect` must stay `true`: the wallet-adapter UI picker only calls
`select(name)` on click, never `adapter.connect()`. With `autoConnect=false`
clicking a wallet silently does nothing.

`SolanaWalletConnector` (`src/services/wallets/`) is a thin shim implementing the
app's `ArNSWalletConnector` interface over the adapter. Its important output is
`solanaSigner` — a `@solana/kit` `TransactionSigner` built by
`walletAdapterToKitSigner.ts` — which is what gets handed to the SDK.
`PrivateKeySolanaWalletConnector` backs the devtools-only private-key login at
`/settings/devtools`.

`ArNSWalletConnector` still carries `contractSigner` / `turboSigner` fields from
the multi-chain era; the Solana connector leaves them `undefined`.

### Dead EVM code

wagmi is still a dependency and `src/utils/baseNetwork.ts`,
`BaseTokenPurchaseService`, and Base-token branches in Checkout still reference
it — but **`WagmiProvider` was removed from the app shell**. Calling a wagmi hook
crashes with `WagmiProviderNotFoundError`. Affected files stub the hooks out with
a `NOTE (de-AO refactor)` comment; the resulting `undefined` values flow into
EVM-funded branches that are unreachable from the Solana-only UI. Do not
"restore" these imports without re-adding the provider.

### Critical polyfills in `src/main.tsx`

Three shims run **before** anything else and must not be reordered or removed:

1. `BigInt.prototype.toJSON` — `@ar.io/sdk`'s Solana backend calls
   `JSON.stringify` on simulation errors containing BigInts. Without this the
   diagnostic stringify throws and the real on-chain failure is swallowed.
2. `Buffer.read/writeBigUInt64LE` — the ESM `buffer@6.0.3` path strips these;
   without them `getBalance` throws and checkout silently shows "0 ARIO".
3. Ed25519 WebCrypto polyfill — feature-detected, then `@solana/webcrypto-ed25519-polyfill`
   is installed for Chrome <137 / Firefox. Required by `generateKeyPairSigner`
   during ANT spawn. React only mounts inside `ed25519PolyfillReady.finally()`.

### State management

React Context + reducer per domain, all nested in `main.tsx` (order matters —
`WalletState` reads from `GlobalState`):

`QueryClientProvider` → `SolanaWalletShell` → `GlobalState` → `WalletState` →
`ArNSState` → `TransactionState` → `RegistrationState` → antd `ConfigProvider` →
`ModalState` → `App`

- **GlobalState**: gateways, Turbo network, `solanaConfig`, ARIO contract
  instance. Persists to `localStorage` under `arns-app-settings` (see
  `useSyncSettings`).
- **WalletState**: bridges `useWallet()` from wallet-adapter into
  `SolanaWalletConnector`, rebuilds the ARIO contract when the signer or
  `solanaConfig` changes, persists `walletType`.

Write flows go through `src/state/actions/` — `dispatchANTInteraction`,
`dispatchArIOInteraction`, `dispatchArNSUpdate`, `dispatchArIOContract`. These
require a connected Solana wallet with a signer and throw otherwise. Interaction
names are the `ANT_INTERACTION_TYPES` / `ARNS_INTERACTION_TYPES` enums in
`src/types.ts`.

### Data fetching

React Query for all server state. `queryClient` in `src/utils/network.ts`
(`gcTime` 1 day, `staleTime` 5 min, `refetchOnWindowFocus: false` — deliberately
tuned to stop refetch storms). An IndexedDB persister is implemented
(`createIDBPersister`) but not currently wired up in `main.tsx`.

Domain logic lives in `src/hooks/use<Feature>.tsx`. Arweave data retrieval goes
through `ArweaveCompositeDataProvider` / `SimpleArweaveDataProvider` in
`src/services/arweave/`.

### Routing

Hash router (`createHashRouter`) with lazy-loaded pages, defined in `App.tsx`.
Two top-level layouts: `Layout` for the app, and a separate `SettingsLayout` for
`/settings/network` and `/settings/devtools`. Breadcrumbs come from per-route
`handle.crumbs` functions; `ANT_FLAG` is a sentinel the Breadcrumbs component
resolves to the ANT's display name.

### Payments

- **Turbo SDK** (`@ardrive/turbo-sdk/web`) — credits, uploads. Logo uploads via
  `useUploadArNSLogo` with progress tracking.
- **Stripe** — fiat, initialized in `App.tsx` keyed on
  `turboNetwork.STRIPE_PUBLISHABLE_KEY` so a network switch remounts `Elements`.
- Checkout payment methods: `crypto` (SOL/ARIO), `credits` (Turbo), `card`
  (Stripe). Base-token branches exist but are unreachable (see Dead EVM code).

Turbo's web build has different type signatures than Node. Import types from
`@ardrive/turbo-sdk/web` (re-exported via `src/types/turbo.ts`) and use
`as unknown as TurboWebAuthenticatedClient` when creating authenticated clients
for web upload — the web `uploadFile` takes `File` directly.
`useUploadArNSLogo.tsx` is the reference usage.

### Styling

TailwindCSS (`tailwind.config.mjs`) + Ant Design with heavy token overrides in
`main.tsx`'s `ConfigProvider` (antd is themed via CSS custom properties like
`var(--primary)`, `var(--card-bg)`). Radix UI for headless primitives, Framer
Motion for animation. Per-component `styles.css`.

## Conventions

### File organization

- **Components**: one folder each, containing `<ComponentName>.tsx`, `styles.css`,
  and `__tests__/`. Test files named `<component-name>.test.ts(x)`.
- **Utils**: `src/utils/`, with colocated or sibling tests.
- **Types for external libs that don't export what we need**: `src/types/`.
- **Images**: `assets/images/{dark,light,common}/`.
- **Translations**: `assets/translations/<native-language-name>.json`.

### Errors and notifications

Import `eventEmitter` from `src/utils/events.ts` to raise notifications.

`NotificationOnlyError` (`src/utils/errors.ts`) for expected, user-facing
problems — shows a notification, no console noise. Subclasses include
`ValidationError`, `InsufficientFundsError`, `WalletNotInstalledError`,
`ANTStateError`, `BaseTokenError`, `TopUpError`, and several legacy wallet errors
(`WanderError`, `MetamaskError`, `BeaconError`, …) kept from the multi-chain era.
Use a plain `Error` for unexpected failures that should be logged.

### Gateway URL routing

Different domains for different jobs — using the wrong one is a real bug:

- **`arweave.net`** — Arweave L1 GraphQL only (`ARWEAVE_HOST`,
  `ARWEAVE_GRAPHQL_URL`).
- **`turbo-gateway.com`** — Arweave data retrieval (`DEFAULT_ARWEAVE`,
  `NETWORK_DEFAULTS.DATA.HOST`, `TURBO.GATEWAY_URL`, static HTML assets).
- **`ar.io`** — ArNS name links (`NETWORK_DEFAULTS.ARNS.HOST`).

### Feature flag: `ARNS_PURCHASES_DISABLED`

In `src/utils/constants.ts`, read at runtime — no other changes needed to toggle.

When `true`, flows that mint new ANTs are blocked: `BUY_RECORD` and
`UPGRADE_NAME`. Affects Register, Checkout, HomeSearch, ReturnedNamesTable, and
the "Permanently Buy" tab on ExtendLease. Disabled controls show
`ARNS_PURCHASES_DISABLED_TOOLTIP`.

Flows on *existing* ANTs are unaffected: `EXTEND_LEASE`, `INCREASE_UNDERNAMES`.

## Configuration

### Environment variables

Vite only exposes an explicit allowlist — never widen the `define` block in
`vite.config.ts` to the whole `process.env`.

- Solana: `VITE_SOLANA_NETWORK`, `VITE_SOLANA_RPC_URL`,
  `VITE_ARIO_CORE_PROGRAM_ID`, `VITE_ARIO_GAR_PROGRAM_ID`,
  `VITE_ARIO_ARNS_PROGRAM_ID`, `VITE_ARIO_ANT_PROGRAM_ID`,
  `VITE_ARIO_MINT_ADDRESS`
- Arweave/Turbo: `VITE_ARWEAVE_HOST`, `VITE_ARWEAVE_GRAPHQL_URL`,
  `VITE_HYPERBEAM_URL`, `VITE_ARNS_NAME`
- Build: `VITE_ENVIRONMENT` (production/develop), `VITE_NODE_ENV`,
  `VITE_GITHUB_HASH`

`VITE_SOLANA_RPC_URL` is read with `||`, not `??`, on purpose — CI injects `""`
when the secret is unset.

### Path aliases

`@src/*` → `./src/*`, `@tests/*` → `./tests/*` (declared in both `tsconfig.json`
and `vite.config.ts`; Jest mirrors them in `moduleNameMapper`).

### Vite specifics

- `esbuild: false` and `optimizeDeps.esbuildOptions.target: 'esnext'` — but build
  output must avoid top-level await (Safari 14 / es2020), which is why the
  Ed25519 polyfill uses an IIFE wrapper.
- `vite-plugin-node-stdlib-browser` supplies Node polyfills for Arweave libs.
- `server.allowedHosts` includes ngrok wildcards for tunnelled dev sessions.

### Jest specifics

`transformIgnorePatterns` explicitly un-ignores `@ar.io`, `@permaweb`,
`arbundles`, `@dha-team/arbundles`, `arweave-wallet-connector`, and `wagmi` —
these ship ESM that must be transformed. Add new ESM-only deps here when they
break tests. `@ar.io/solana-contracts` subpaths are remapped to their built
`lib/*/index.js`.

## Git hooks

- **pre-commit**: `lint-staged` → `biome check --write --unsafe` + `biome format --write`
- **commit-msg**: commitlint, conventional commits (`feat`, `fix`, `docs`,
  `style`, `refactor`, `test`, `chore`), no length limits

## CI/CD

`.github/workflows/`: `build_and_test.yml`, `pr-preview.yaml`,
`staging_deploy.yml`, `production.yml`.
