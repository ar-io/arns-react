import { ARIO } from '@ar.io/sdk/web';
import { useWallet } from '@solana/wallet-adapter-react';
import { SolanaWalletConnector } from '@src/services/wallets';
import { getSolanaRpc, getSolanaRpcSubscriptions } from '@src/utils/solana';
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

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

  const [
    { blockHeight, arioTicker, arioContract, solanaConfig },
    dispatchGlobalState,
  ] = useGlobalState();

  const { walletAddress, wallet } = state;

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

    const signer = wallet?.solanaSigner;
    console.debug('[WalletState] init Solana ARIO', {
      hasSigner: !!signer,
      walletAddress,
      network: solanaConfig.network,
    });
    dispatchArIOContract({
      contract: ARIO.init(
        signer
          ? {
              backend: 'solana',
              rpc: getSolanaRpc(),
              rpcSubscriptions: getSolanaRpcSubscriptions(),
              signer,
              ...programIds,
            }
          : {
              backend: 'solana',
              rpc: getSolanaRpc(),
              ...programIds,
            },
      ),
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
  // - We bail when the wallet is already a Solana connector AND the address
  //   matches, so we don't rebuild the connector on every adapter
  //   re-render.
  const solanaWallet = useWallet();
  useEffect(() => {
    if (!solanaWallet.connected || !solanaWallet.publicKey) return;
    const addr = solanaWallet.publicKey.toBase58();
    const alreadyWired =
      wallet?.tokenType === 'solana' && walletAddress?.toString() === addr;
    if (alreadyWired) return;

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
    } catch (error) {
      console.error('[WalletState] failed to wire connector', error);
      eventEmitter.emit('error', error);
    }
  }, [
    solanaWallet.connected,
    solanaWallet.publicKey,
    solanaWallet.signTransaction,
    wallet,
    walletAddress,
  ]);

  useEffect(() => {
    updateIfConnected();
  }, []);

  useEffectOnce(() => {
    setTimeout(() => {
      dispatchWalletState({
        type: 'setWalletStateInitialized',
      });
    }, 5000);
  });

  useEffect(() => {
    if (walletAddress) {
      updateBalances(walletAddress, arioTicker);
    }
    // arioContract is included so balance refreshes when the backend swaps
    // (e.g. Solana RPC override).
  }, [walletAddress, blockHeight, arioTicker, arioContract]);

  async function updateBalances(address: AoAddress, arioTicker: string) {
    try {
      const arioBalanceMario = await arioContract
        .getBalance({ address: address.toString() })
        .catch((error) => {
          eventEmitter.emit('error', error);
          return 0;
        });

      // SDK returns mARIO; convert to ARIO display units.
      const arioBalance = arioBalanceMario / 1_000_000;

      dispatchWalletState({
        type: 'setBalances',
        payload: {
          [arioTicker]: arioBalance,
          ar: 0,
        },
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  async function updateIfConnected() {
    // Solana wallet rehydration is driven by `<WalletProvider autoConnect>`
    // and the `ConnectWalletModal` picker effect — there's nothing to do
    // here. We simply flip the `walletStateInitialized` flag so the rest
    // of the app stops waiting on us.
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
