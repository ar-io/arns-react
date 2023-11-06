import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { useEffectOnce } from '../../hooks/useEffectOnce/useEffectOnce';
import { ArConnectWalletConnector } from '../../services/wallets';
import { ARCONNECT_WALLET_PERMISSIONS } from '../../services/wallets/ArConnectWalletConnector';
import { ArweaveTransactionID, ArweaveWalletConnector } from '../../types';
import { ARNS_REGISTRY_ADDRESS } from '../../utils/constants';
import eventEmitter from '../../utils/events';
import { WalletAction } from '../reducers/WalletReducer';
import { useGlobalState } from './GlobalState';

export type WalletState = {
  walletAddress?: ArweaveTransactionID;
  wallet?: ArweaveWalletConnector;
  balances: {
    ar: number;
    io: number;
  };
  walletStateInitialized: boolean;
};

const initialState: WalletState = {
  walletAddress: undefined,
  wallet: undefined,
  balances: {
    ar: 0,
    io: 0,
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
export default function WalletStateProvider({
  reducer,
  children,
}: StateProviderProps): JSX.Element {
  const [state, dispatchWalletState] = useReducer(reducer, initialState);

  const [{ arweaveDataProvider, blockHeight }] = useGlobalState();

  const { walletAddress } = state;

  useEffect(() => {
    window.addEventListener('arweaveWalletLoaded', updateIfConnected);

    return () => {
      window.removeEventListener('arweaveWalletLoaded', updateIfConnected);
    };
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
      updateBalances(walletAddress);
    }
  }, [walletAddress, blockHeight]);

  async function updateBalances(address: ArweaveTransactionID) {
    try {
      const [ioBalance, arBalance] = await Promise.all([
        arweaveDataProvider.getTokenBalance(
          address,
          new ArweaveTransactionID(ARNS_REGISTRY_ADDRESS),
        ),
        arweaveDataProvider.getArBalance(address),
      ]);

      dispatchWalletState({
        type: 'setBalances',
        payload: {
          io: ioBalance,
          ar: arBalance,
        },
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  async function updateIfConnected() {
    const connector = new ArConnectWalletConnector();
    dispatchWalletState({
      type: 'setWallet',
      payload: connector,
    });

    try {
      // check if wallet has permissions and reconnect
      const permissions = await window.arweaveWallet.getPermissions();

      if (ARCONNECT_WALLET_PERMISSIONS.every((p) => permissions.includes(p))) {
        // await connector.connect();
        const address = await connector.getWalletAddress();

        dispatchWalletState({
          type: 'setWalletAddress',
          payload: address,
        });
      }
    } catch (error) {
      // intentionally swallow error here
      // eventEmitter.emit('error', error);
    } finally {
      dispatchWalletState({
        type: 'setWalletStateInitialized',
      });
    }
  }

  return (
    <WalletStateContext.Provider value={[state, dispatchWalletState]}>
      {children}
    </WalletStateContext.Provider>
  );
}
