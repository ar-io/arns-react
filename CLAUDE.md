# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is a React application for the Arweave Name System (ArNS) Registry,
allowing users to search for and purchase Names. Built with Vite, React 18,
TypeScript, and TailwindCSS.

## Development Commands

### Setup and Running

```bash
yarn                  # Install dependencies
yarn dev              # Start development server (sets NODE_ENV=prod, VITE_GITHUB_HASH=local)
yarn build            # Build for production (includes TypeScript compilation and Vite build with increased memory)
yarn preview          # Preview production build
```

### Testing

```bash
yarn test                    # Run Jest unit tests
yarn test:updateSnapshot     # Update Jest snapshots
yarn test:coverage          # Run tests with coverage report (80% threshold for branches/functions/lines)
yarn test:playwright        # Run Playwright e2e tests
```

To run a single test file:

```bash
# Cross-platform (recommended)
yarn cross-env NODE_ENV=test jest path/to/test.test.ts

# Or use npx
npx cross-env NODE_ENV=test jest path/to/test.test.ts
```

### Code Quality

```bash
yarn lint:check      # Check for linting errors with Biome
yarn lint:fix        # Auto-fix linting errors with Biome
yarn format:check    # Check code formatting with Biome
yarn format:fix      # Auto-format code with Biome
yarn pre-commit      # Run lint-staged (triggered by Husky pre-commit hook)
```

### Other Commands

```bash
yarn storybook           # Start Storybook dev server on port 6006
yarn build-storybook     # Build Storybook
yarn docs:serve          # Generate and serve TypeDoc documentation
yarn clean               # Remove dist directory
```

## Architecture

### State Management

The application uses React Context API with reducer pattern for state
management. There are multiple domain-specific contexts, each with their own
reducer:

- **GlobalState** (`src/state/contexts/GlobalState.tsx`): Gateway configuration,
  AO network settings, Turbo network configuration, ArIO contract, blockchain
  height, process IDs
- **WalletState**: Wallet connection, balance, address
- **ArNSState**: ArNS records and domain-related state
- **TransactionState**: Transaction tracking and history
- **RegistrationState**: Domain registration flow state
- **ModalState**: Modal visibility and content

All contexts are initialized in `src/main.tsx` with a nested provider structure.
State is persisted to localStorage for settings via the `useSyncSettings` hook.

### Data Layer

**Arweave Data Providers** (`src/services/arweave/`):

- `ArweaveCompositeDataProvider`: Main data provider that aggregates multiple
  sources
- `SimpleArweaveDataProvider`: Basic Arweave data fetching

**React Query** (`@tanstack/react-query`):

- Used extensively for server state management via custom hooks in `src/hooks/`
- Configured in `src/utils/network.ts` with `queryClient`
- IndexedDB persister available but currently commented out in main.tsx

**Custom Hooks** (`src/hooks/`):

- Follow the naming pattern `use<Feature>.tsx`
- Examples: `useArNSRecord`, `useGateways`, `useTurboArNSClient`,
  `usePrimaryName`
- Encapsulate data fetching, transformations, and domain logic

### AO Integration

The app integrates with the AO (Arweave Operating System) ecosystem:

- **AR.IO SDK** (`@ar.io/sdk/web`): Primary interface for ArNS operations,
  gateways, and ArIO contracts
- **AO Connect** (`@permaweb/aoconnect`): AO process communication
- Process IDs configured for ARIO and ANT Registry
- ANT (Arweave Name Token) operations handled via `AoANTHandler`

### Routing

Hash-based routing using React Router v6 (`createHashRouter`):

- Routes defined in `src/App.tsx` with lazy loading for pages
- Main routes: `/`, `/register`, `/manage`, `/manage/:domain`,
  `/undernames/:domain`, `/ant/:antId`, `/prices`, `/settings/*`
- Sentry integration via `wrapCreateBrowserRouter`

### Wallet Integration

Supports multiple wallet types via:

**Arweave Wallets**:
- **Wander** (formerly ArConnect) - Primary Arweave wallet (`arconnect`)
- **Arweave.app** (`arweave-wallet-connector`)
- **Beacon** - Mobile wallet connector

**Ethereum Wallets** (via Rainbow Kit + Wagmi):
- **Rainbow Kit** (`@rainbow-me/rainbowkit`) - Multi-wallet modal supporting 100+ wallets
- **Wagmi** for Ethereum wallet state and interactions
- Configured in `src/main.tsx` with `getDefaultConfig()`
- Supported chains: Ethereum mainnet, Base, and Polygon
- WalletConnect Project ID: hardcoded in `src/utils/constants.ts`

**Wallet Connectors** (`src/services/wallets/`):
- `WanderWalletConnector` - Wander/ArConnect
- `ArweaveAppWalletConnector` - arweave.app
- `BeaconWalletConnector` - Beacon mobile
- `EthWalletConnector` - Generic Ethereum (works with any wagmi connector)

**Key Types** (`src/types.ts`):
- `ArNSWalletConnector` interface defines the common contract for all wallets
- `WALLET_TYPES` enum: `WANDER`, `ARWEAVE_APP`, `ETHEREUM`, `BEACON`
- `AoAddress` = `EthAddress | ArweaveTransactionID` (union type for all addresses)
- `EthAddress` = `` `0x${string}` `` (Ethereum address format)
- Wallet type persisted to `localStorage` as `walletType` key

Wallet state managed in `WalletState` context with reconnection logic for each
wallet type

### Payment Systems

- **Turbo SDK** (`@ardrive/turbo-sdk`): Credits and uploads
  - Web-specific upload implementation uses `@ardrive/turbo-sdk/web`
  - Custom type definitions in `src/types/turbo.ts` provide type safety for web
    upload operations (SDK doesn't export web-specific types)
  - Image uploads handled via `useUploadArNSLogo` hook with progress tracking
- **Stripe** (`@stripe/react-stripe-js`, `@stripe/stripe-js`): Fiat payments
- Stripe initialized in App.tsx with network-specific publishable key

### Styling

- **TailwindCSS** with custom configuration (`tailwind.config.mjs`)
- **Ant Design** (`antd`) for UI components with custom theming
- **Radix UI** for headless components (checkbox, radio, select, switch)
- **Framer Motion** for animations
- CSS modules pattern: component folders contain `styles.css`

## File Organization Rules

### Components

- Create a folder for each component containing:
  - `<ComponentName>.tsx` - exported component file
  - `__tests__/` - testing folder
  - `styles.css` - component styles
- Test files named: `<component-name>.test.ts`

### Utilities

- Place in `src/utils/` folder with its own testing folder
- Path alias: `@src/utils/*`
- Image utilities in `src/utils/imageUtils.ts` for validation, compression, and
  dimension checking

### Types

- TypeScript type definitions in `src/types/` for external libraries that don't
  export needed types
- Example: `src/types/turbo.ts` provides web-specific Turbo SDK types

### Images

- Location: `assets/images/<theme-type>/`
- `dark/` - dark mode specific images
- `light/` - light mode specific images
- `common/` - shared across themes

### Translations

- Location: `assets/translations/`
- Named: `<native-languages-name>.json`

## Error Handling and Notifications

### Event Emitter Pattern

Import `eventEmitter` from `src/utils/events.ts` to emit notifications.

### Error Types (`src/utils/errors.ts`)

- **NotificationOnlyError**: Shows notification but does NOT emit to Sentry
  - Subclasses: `ValidationError`, `WanderError`, `ArweaveAppError`,
    `MetamaskError`, `EthereumWalletError`, `BeaconError`, `InsufficientFundsError`,
    `WalletNotInstalledError`, `UpgradeRequiredError`, `ANTStateError`
- **Standard Error**: Automatically reported to Sentry for unhandled errors

Use `NotificationOnlyError` for expected/user-facing errors. Use standard
`Error` for unexpected errors that should be tracked.

## Build and Deployment

### Production Build

- TypeScript compilation followed by Vite build
- Source maps enabled
- Sentry plugin integration for error tracking (disabled when deploying to
  Permaweb)
- Large memory allocation: `--max-old-space-size=32768`

### Environment Variables

- Defined in Vite config, not exposed via process.env for security
- Key variables: `VITE_ARWEAVE_HOST`, `VITE_ARWEAVE_GRAPHQL_URL`,
  `VITE_HYPERBEAM_URL`, `VITE_SENTRY_*`, `VITE_ARNS_NAME`

### Arweave Deployment

```bash
yarn publish:arweave  # Deploys to Arweave using permaweb-deploy with ARNS name
```

### CI/CD

Workflows in `.github/workflows/`:

- `build_and_test.yml` - Build and test on PR
- `pr.yml` - PR checks
- `staging_deploy.yml` - Staging deployments
- `production.yml` - Production deployments

## Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

- `@src/*` → `./src/*`
- `@tests/*` → `./tests/*`

## Git Hooks

- **pre-commit**: Runs `lint-staged` which lints TypeScript files and formats
  all files
- **commit-msg**: Uses `commitlint` with conventional commit format
  - Standard types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - No max length restrictions on header or body

## Feature Flags

### ArNS Name Purchases (`ARNS_PURCHASES_DISABLED`)

When `true`, flows that create new ANTs are blocked: new name registration
(`BUY_RECORD`) and upgrade to permabuy (`UPGRADE_NAME`). Affected components:
Register, Checkout, HomeSearch, ReturnedNamesTable, and the "Permanently Buy"
tab on ExtendLease. Disabled buttons show a tooltip from
`ARNS_PURCHASES_DISABLED_TOOLTIP`.

Flows that operate on existing ANTs are **not** affected: lease extensions
(`EXTEND_LEASE`) and undername upgrades (`INCREASE_UNDERNAMES`).

- **Location:** `src/utils/constants.ts`
- **To disable purchases:** set `ARNS_PURCHASES_DISABLED = true`
- **To enable purchases:** set `ARNS_PURCHASES_DISABLED = false`

No other code changes are required; the flag is read at runtime.

## Gateway URL Routing

Different gateway domains are used for different purposes:

- **GraphQL** (`arweave.net`): Arweave L1 GraphQL queries — `ARWEAVE_HOST`,
  `ARWEAVE_GRAPHQL_URL`, NetworkSettings suConnect
- **Transaction/data fetching** (`turbo-gateway.com`): Arweave data retrieval —
  `DEFAULT_ARWEAVE`, `TURBO.GATEWAY_URL`, static HTML asset URLs
- **ArNS name links** (`ar.io`): ArNS domain resolution —
  `NETWORK_DEFAULTS.ARNS.HOST`, GlobalState `gateway` default

When adding new URLs, use the correct domain for the purpose. Do not use
`arweave.net` for data fetching or `turbo-gateway.com` for ArNS links.

## Important Implementation Notes

### Smartweave Contract Deployment

Contracts are deployed manually to avoid the Warp Deploy Plugin which doesn't
implement tree shaking. This saves ~2MB in build size. Switch to Warp core
package deployment when tree shaking is supported or when deployment becomes
more complex (e.g., L2 usage).

### ANT Version Compatibility

Minimum ANT version: 16 (`MIN_ANT_VERSION` in `src/utils/constants.ts`) All
workflows (reassign, release, etc.) must be compatible with this version.

### Node Polyfills

Vite is configured with `vite-plugin-node-stdlib-browser` for Node.js polyfills
required by Arweave libraries.

### TypeScript Configuration

- Target: ESNext
- Module resolution: bundler
- Strict mode enabled
- No emit (Vite handles compilation)

### Ethereum Wallet Signer Architecture

The `EthWalletConnector` creates two types of signers for Ethereum wallets:

- **Turbo Signer** (`TurboArNSSigner`): For logo uploads via Turbo SDK
- **AO Signer** (`ContractSigner`): For ArNS/ANT interactions via AO messaging

Both use `InjectedEthereumSigner` from AR.IO SDK. Public key is derived by:
1. Signing message: "Sign this message to connect to ArNS.app"
2. Recovering public key from signature using `viem/recoverPublicKey`
3. Storing in signer for subsequent AO data item signing

### Turbo SDK Type Safety

The Turbo SDK's web implementation has different type signatures than its
Node.js counterpart. To maintain type safety:

- Import types directly from `@ardrive/turbo-sdk/web` (TurboUploadDataItemResponse,
  TurboUploadEventsAndPayloads, DataItemOptions)
- `src/types/turbo.ts` re-exports these types for convenience
- Use type assertions (`as unknown as TurboWebAuthenticatedClient`) when creating
  TurboFactory.authenticated clients for web upload operations since the web
  implementation's `uploadFile` method accepts `File` objects directly
- The `useUploadArNSLogo` hook (src/hooks/useUploadArNSLogo.tsx) demonstrates
  proper usage pattern for web uploads with progress tracking

### Rainbow Kit / Wagmi Configuration

Rainbow Kit is configured in `src/main.tsx` with `getDefaultConfig()`:
- WalletConnect Project ID is hardcoded in `src/utils/constants.ts` as `WALLETCONNECT_PROJECT_ID`
- Supported chains: Ethereum mainnet, Base, and Polygon
- The provider hierarchy is: WagmiProvider → QueryClientProvider → RainbowKitProvider → App contexts
