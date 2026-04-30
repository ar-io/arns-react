import { ARIO } from '@ar.io/sdk/web';
import {
  SOLANA_PROGRAM_IDS,
  getSolanaRpc,
  getSolanaRpcSubscriptions,
} from '@src/utils/solana';
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { useEffectOnce } from '../../hooks/useEffectOnce/useEffectOnce';
import { AoAddress, ArNSWalletConnector } from '../../types';
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

  const [{ blockHeight, arioTicker, arioContract }, dispatchGlobalState] =
    useGlobalState();

  const { walletAddress, wallet } = state;

  useEffect(() => {
    if (!walletAddress) {
      wallet?.disconnect();
      return;
    }

    // Solana-only wallet path. `ARIO.init` with `backend: 'solana'` returns
    // a `SolanaARIOWriteable` that issues on-chain instructions via
    // `@solana/kit` and our wallet-adapter signer. When the adapter hasn't
    // attached its `signTransaction` yet (Phantom does this a tick after
    // `connected`), `solanaSigner` is undefined and we fall back to a
    // read-only client so the rest of the app can render. The next render
    // of this effect — fired when `wallet` mutates after the picker re-emits
    // with the signer attached — promotes the client to a writeable instance.
    const signer = wallet?.solanaSigner;
    console.debug('[WalletState] init Solana ARIO', {
      hasSigner: !!signer,
      walletAddress,
    });
    dispatchArIOContract({
      contract: ARIO.init(
        signer
          ? {
              backend: 'solana',
              rpc: getSolanaRpc(),
              rpcSubscriptions: getSolanaRpcSubscriptions(),
              signer,
              ...SOLANA_PROGRAM_IDS,
            }
          : {
              backend: 'solana',
              rpc: getSolanaRpc(),
              ...SOLANA_PROGRAM_IDS,
            },
      ),
      dispatch: dispatchGlobalState,
    });
  }, [walletAddress, wallet]);

  useEffect(() => {
    // Solana auto-reconnect lives inside `<WalletProvider autoConnect>` from
    // `@solana/wallet-adapter-react`; the picker's `useEffect` in
    // `ConnectWalletModal` then rehydrates our `SolanaWalletConnector`. So
    // there's nothing to do here on mount — but we still mark the wallet
    // state as initialized so gated UI (PageLoader) unblocks promptly.
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
