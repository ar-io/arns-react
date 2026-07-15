import { ARIO } from '@ar.io/sdk/web';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  EthWalletConnector,
  SolanaWalletConnector,
  WanderWalletConnector,
} from '@src/services/wallets';
import { getSolanaRpc, getSolanaRpcSubscriptions } from '@src/utils/solana';
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { useAccount, useConfig } from 'wagmi';

import { useEffectOnce } from '../../hooks/useEffectOnce/useEffectOnce';
import { AoAddress, ArNSWalletConnector, WALLET_TYPES } from '../../types';
import eventEmitter from '../../utils/events';
import { dispatchArIOContract } from '../actions/dispatchArIOContract';
import { WalletAction } from '../reducers/WalletReducer';
import { useGlobalState } from './GlobalState';

export type WalletState = {
  walletAddress?: AoAddress;
  wallet?: ArNSWalletConnector;
  balances: {
    ar: number;
    [x: string]: number;
  };
  walletStateInitialized: boolean;
};

const initialState: WalletState = {
  walletAddress: undefined,
  wallet: undefined,
  balances: {
    ar: 0,
  },
  walletStateInitialized: false,
};

const WalletStateContext = createContext<[WalletState, Dispatch<WalletAction>]>(
  [initialState, () => initialState],
);

export const useWalletState = (): [WalletState, Dispatch<WalletAction>] =>
  useContext(WalletStateContext);

type StateProviderProps = {
  reducer: React.Reducer<WalletState, WalletAction>;
  children: React.ReactNode;
};

/** Create provider to wrap app in */
export function WalletStateProvider({
  reducer,
  children,
}: StateProviderProps): JSX.Element {
  const [state, dispatchWalletState] = useReducer(reducer, initialState);

  const [{ solanaConfig }, dispatchGlobalState] = useGlobalState();

  const { walletAddress, wallet } = state;

  // Ethereum (wagmi) session — used to rehydrate an `EthWalletConnector` when
  // the user previously connected an EVM wallet (Model A). Safe to call now
  // that `main.tsx` mounts the `WagmiProvider` again.
  const wagmiConfig = useConfig();
  const ethAccount = useAccount();

  useEffect(() => {
    if (!walletAddress) {
      wallet?.disconnect();
      return;
    }

    const programIds: Record<string, any> = {};
    if (solanaConfig.programIds.coreProgramId)
      programIds.coreProgramId = solanaConfig.programIds.coreProgramId;
    if (solanaConfig.programIds.garProgramId)
      programIds.garProgramId = solanaConfig.programIds.garProgramId;
    if (solanaConfig.programIds.arnsProgramId)
      programIds.arnsProgramId = solanaConfig.programIds.arnsProgramId;
    if (solanaConfig.programIds.antProgramId)
      programIds.antProgramId = solanaConfig.programIds.antProgramId;

    // Only the Solana identity (Model B — user-owned ANT) contributes a signer
    // to the on-chain ARIO client. For Arweave / Ethereum (Model A) the bundler
    // custodies the ANT and settles the buy server-side, so we intentionally do
    // NOT wire their signer into `ARIO.init`. A read-only Solana ARIO client is
    // still built so name resolution / lookups keep working for every identity.
    const signer =
      wallet?.tokenType === 'solana' ? wallet?.solanaSigner : undefined;
    console.debug('[WalletState] init ARIO', {
      tokenType: wallet?.tokenType,
      hasSigner: !!signer,
      walletAddress,
      network: solanaConfig.network,
    });
    const contract = signer
      ? ARIO.init({
          rpc: getSolanaRpc(),
          rpcSubscriptions: getSolanaRpcSubscriptions(),
          signer,
          ...programIds,
        })
      : ARIO.init({
          rpc: getSolanaRpc(),
          ...programIds,
        });
    dispatchArIOContract({
      contract,
      dispatch: dispatchGlobalState,
    });
  }, [walletAddress, wallet, solanaConfig]);

  // Bridge `@solana/wallet-adapter-react` → our `SolanaWalletConnector`.
  //
  // The adapter's `<WalletProvider autoConnect>` rehydrates the user's
  // previously-selected wallet (Phantom etc.) on every mount, but emits its
  // state via the `useWallet()` hook — it never knows about our connector
  // wrapper. We used to do this bridging only inside `ConnectWalletModal`,
  // which meant a page reload on any non-`/connect` route left the app in a
  // disconnected state until the user navigated to `/connect`. Doing it
  // here in `WalletStateProvider` (which wraps the whole app) makes
  // reconnection happen on every mount, regardless of route.
  //
  // Gating notes:
  // - `publicKey` is required (means the user picked AND approved); we
  //   tolerate `signTransaction` being undefined for one tick (Phantom
  //   attaches it slightly after `connected` flips). The connector re-binds
  //   the signer when the next render fires with the method attached.
  // - We bail when we've already wired *this adapter publicKey* into a
  //   connector, tracked in `wiredPublicKeyRef`. We deliberately don't gate
  //   on `walletAddress` here — the UserAddress devtool lets a developer
  //   override the active address without disconnecting the wallet, and an
  //   address-based gate would refire this effect and clobber the override
  //   back to the adapter's publicKey on the next render.
  // - We also bail when a non-Solana (Arweave / ETH) wallet is already
  //   connected so the Solana adapter's autoConnect can't clobber it.
  const solanaWallet = useWallet();
  const wiredPublicKeyRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!solanaWallet.connected || !solanaWallet.publicKey) {
      wiredPublicKeyRef.current = undefined;
      return;
    }
    // Don't override an active non-Solana identity with the Solana adapter's
    // rehydrated session.
    if (wallet && wallet.tokenType !== 'solana') {
      return;
    }
    const addr = solanaWallet.publicKey.toBase58();
    if (wallet?.tokenType === 'solana' && wiredPublicKeyRef.current === addr) {
      return;
    }

    try {
      const connector = new SolanaWalletConnector({
        publicKey: solanaWallet.publicKey,
        connected: solanaWallet.connected,
        connecting: solanaWallet.connecting,
        disconnect: solanaWallet.disconnect,
        signTransaction: solanaWallet.signTransaction as never,
      });
      localStorage.setItem('walletType', WALLET_TYPES.SOLANA);
      console.info(
        '[WalletState] auto-reconnect SolanaWalletConnector for',
        addr,
      );
      dispatchWalletState({
        type: 'setWalletAndAddress',
        payload: {
          wallet: connector,
          walletAddress: addr as never,
        },
      });
      wiredPublicKeyRef.current = addr;
    } catch (error) {
      console.error('[WalletState] failed to wire connector', error);
      eventEmitter.emit('error', error);
    }
  }, [
    solanaWallet.connected,
    solanaWallet.publicKey,
    solanaWallet.signTransaction,
    wallet,
  ]);

  // Rehydrate an Arweave (Wander / injected `window.arweaveWallet`) identity.
  // The extension fires `arweaveWalletLoaded` once injected; we also try on
  // mount for the case where it injected before React hydrated.
  useEffect(() => {
    window.addEventListener('arweaveWalletLoaded', reconnectArweaveIfSelected);
    return () => {
      window.removeEventListener(
        'arweaveWalletLoaded',
        reconnectArweaveIfSelected,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reconnectArweaveIfSelected() {
    const walletType = window.localStorage.getItem('walletType');
    if (walletType !== WALLET_TYPES.WANDER) return;
    try {
      const connector = new WanderWalletConnector();
      const address = await connector.getWalletAddress();
      await connector.updatePermissions();
      dispatchWalletState({
        type: 'setWalletAndAddress',
        payload: {
          wallet: connector,
          walletAddress: address,
        },
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  // Rehydrate an Ethereum identity once wagmi restores the session (mirrors the
  // `arweaveWalletLoaded` behaviour for Arweave). Only when the user last chose
  // ETH and no other wallet is already wired.
  useEffect(() => {
    const walletType = window.localStorage.getItem('walletType');
    if (
      walletType === WALLET_TYPES.ETHEREUM &&
      ethAccount.isConnected &&
      ethAccount.address &&
      ethAccount.connector &&
      (!wallet || wallet.tokenType === 'ethereum') &&
      ethAccount.address !== walletAddress
    ) {
      try {
        const connector = new EthWalletConnector(
          wagmiConfig,
          ethAccount.connector,
        );
        dispatchWalletState({
          type: 'setWalletAndAddress',
          payload: {
            wallet: connector,
            walletAddress: ethAccount.address as never,
          },
        });
      } catch (error) {
        eventEmitter.emit('error', error);
      }
    }
  }, [
    ethAccount.isConnected,
    ethAccount.address,
    ethAccount.connector,
    wallet,
    walletAddress,
    wagmiConfig,
  ]);

  // Handle external Ethereum wallet disconnection (user disconnects from the
  // extension) so app state doesn't retain a stale ETH identity.
  useEffect(() => {
    if (
      !ethAccount.isConnected &&
      wallet instanceof EthWalletConnector &&
      walletAddress
    ) {
      localStorage.removeItem('walletType');
      dispatchWalletState({
        type: 'setWalletAndAddress',
        payload: {
          wallet: undefined,
          walletAddress: undefined,
        },
      });
    }
  }, [ethAccount.isConnected, wallet, walletAddress]);

  useEffect(() => {
    updateIfConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffectOnce(() => {
    setTimeout(() => {
      dispatchWalletState({
        type: 'setWalletStateInitialized',
      });
    }, 5000);
  });

  // Balance is fetched via React Query hooks (useArIOLiquidBalance) with
  // proper caching and deduplication. The previous uncached getBalance()
  // call here fired on every blockHeight change (~2 min), on every
  // arioContract rebuild, and on every wallet connect — duplicating work
  // and contributing to RPC 429 rate-limit errors.

  async function updateIfConnected() {
    // Solana wallet rehydration is driven by `<WalletProvider autoConnect>`
    // and the `ConnectWalletModal` picker effect. Arweave/ETH rehydration is
    // driven by the effects above. Here we additionally attempt an eager
    // Arweave reconnect (covers the case where the extension injected before
    // this component mounted), then flip `walletStateInitialized` so the rest
    // of the app stops waiting on us.
    await reconnectArweaveIfSelected();
    dispatchWalletState({
      type: 'setWalletStateInitialized',
    });
  }

  return (
    <WalletStateContext.Provider value={[state, dispatchWalletState]}>
      {children}
    </WalletStateContext.Provider>
  );
}
