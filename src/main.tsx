// `Buffer.read/writeBigUInt64LE` polyfill. The browser-side `buffer@6.0.3`
// shim exposes these via `defineBigIntMethod` — but the ESM build path
// some bundlers pick up (when `Buffer` lands on a non-prototype proxy)
// has them stripped or wired to a Uint8Array that lacks the prototype
// chain. The SDK's Solana backend (`io-readable.getBalance`,
// `deserialize.ts`, PDA derivation) and the SurfpoolTools dev faucet
// rely on these methods; without the patch every getBalance call throws
// `vu.readBigUInt64LE is not a function` and the checkout payment
// option silently shows "0 ARIO" balance.
//
// Idempotent: if the methods are already present we leave them alone.
import { Buffer as BufferShim } from 'buffer';
if (typeof globalThis !== 'undefined') {
  // Make sure `Buffer` is available globally (some SDK call sites assume it).
  (globalThis as any).Buffer = (globalThis as any).Buffer ?? BufferShim;
}
{
  const proto = (BufferShim as any).prototype as any;
  if (typeof proto.readBigUInt64LE !== 'function') {
    proto.readBigUInt64LE = function (offset = 0) {
      let v = 0n;
      for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(this[offset + i]);
      return v;
    };
  }
  if (typeof proto.writeBigUInt64LE !== 'function') {
    proto.writeBigUInt64LE = function (value: bigint, offset = 0) {
      let v = BigInt(value);
      for (let i = 0; i < 8; i++) {
        this[offset + i] = Number(v & 0xffn);
        v >>= 8n;
      }
      return offset + 8;
    };
  }
  if (typeof proto.readBigInt64LE !== 'function') {
    proto.readBigInt64LE = function (offset = 0) {
      let v = 0n;
      for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(this[offset + i]);
      // Sign-extend from 64 bits.
      return v & (1n << 63n) ? v - (1n << 64n) : v;
    };
  }
}

// Ed25519 polyfill MUST be installed before any Solana code runs.
// `@solana/kit`'s `generateKeyPairSigner` (used during ANT spawn) calls
// `crypto.subtle.generateKey({ name: 'Ed25519' })`. Chrome <137 and Firefox
// don't expose Ed25519 in WebCrypto yet
// (https://github.com/WICG/webcrypto-secure-curves/issues/20), so without
// this shim the checkout flow throws
// `SolanaError: This runtime does not support the generation of Ed25519 key pairs.`
//
// Chrome 137+ ships native Ed25519. We feature-detect first so we don't
// install the polyfill (and trigger its "you don't need me" console warn)
// in browsers that already support it.
async function maybeInstallEd25519Polyfill() {
  try {
    await crypto.subtle.generateKey('Ed25519', false, ['sign', 'verify']);
    return; // native support — no polyfill needed.
  } catch {
    /* fall through to polyfill */
  }
  const { install } = await import('@solana/webcrypto-ed25519-polyfill');
  install();
}
// IIFE wrapper avoids top-level await (esbuild target es2020 / Safari 14
// don't support TLA in build output).
const ed25519PolyfillReady = maybeInstallEd25519Polyfill();

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';

import { SOLANA_RPC_URL } from './utils/solana';

import App from './App';
import './index.css';
import {
  ArNSStateProvider,
  GlobalStateProvider,
  ModalStateProvider,
  RegistrationStateProvider,
  TransactionStateProvider,
  WalletStateProvider,
  arnsReducer,
  modalReducer,
  reducer,
  registrationReducer,
  transactionReducer,
  walletReducer,
} from './state';
import { queryClient } from './utils/network';
// setup sentry
import './utils/sentry';

/**
 * Solana provider stack.
 *
 * `wallets={[]}` lets `@solana/wallet-adapter-react` discover wallets via
 * the Wallet Standard registry — Phantom, Solflare, Backpack, Glow, etc.
 * all self-register that way now, so the legacy per-wallet adapter packages
 * are unnecessary (and Phantom in particular logs a warning if you include
 * its adapter alongside its Standard registration).
 *
 * `autoConnect` MUST be true: the wallet-adapter-react-ui picker only calls
 * `select(name)` on click — it does NOT call `adapter.connect()`. With
 * `autoConnect=false` the wallet is selected but never prompts the user, so
 * clicking Phantom in the modal appears to do nothing. With `autoConnect=true`
 * the WalletProvider's effect notices the freshly selected adapter and fires
 * `connect()`, which triggers the extension popup.
 *
 * `onError` surfaces adapter-level errors to the console; the default swallows
 * them via toast/notification systems we don't wire up here.
 */
function SolanaWalletShell({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [], []);
  return (
    <ConnectionProvider endpoint={SOLANA_RPC_URL}>
      <WalletProvider
        wallets={wallets}
        autoConnect
        onError={(error) => {
          console.error('[solana-wallet-adapter] error:', error);
        }}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

ed25519PolyfillReady.finally(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <SolanaWalletShell>
          <GlobalStateProvider reducer={reducer}>
            <WalletStateProvider reducer={walletReducer}>
              <ArNSStateProvider reducer={arnsReducer}>
                <TransactionStateProvider reducer={transactionReducer}>
                  <RegistrationStateProvider reducer={registrationReducer}>
                    <ConfigProvider
                      theme={{
                        token: {
                          colorBgBase: 'var(--primary)',
                        },
                        components: {
                          Button: {
                            colorBgBase: 'var(--primary)',
                          },
                          Progress: {
                            colorText: 'var(--text-white)',
                          },
                          Input: {
                            addonBg: 'var(--card-bg)',
                            colorBgContainer: 'var(--bg-color)',
                            activeBg: 'var(--bg-color)',
                            hoverBg: 'var(--bg-color)',
                            colorText: 'var(--text-white)',
                            colorTextPlaceholder: 'var(--text-grey)',
                            activeBorderColor: 'var(--primary)',
                            hoverBorderColor: 'var(--bg-color)',
                            colorIcon: 'var(--text-grey)',
                            colorPrimary: 'var(--primary)',
                            borderRadius: 3,
                            lineWidth: 0.5,
                            lineWidthFocus: 1,
                            lineWidthBold: 0,
                          },
                        },
                      }}
                    >
                      <ModalStateProvider reducer={modalReducer}>
                        <App />
                      </ModalStateProvider>
                    </ConfigProvider>
                  </RegistrationStateProvider>
                </TransactionStateProvider>
              </ArNSStateProvider>
            </WalletStateProvider>
          </GlobalStateProvider>
        </SolanaWalletShell>
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
