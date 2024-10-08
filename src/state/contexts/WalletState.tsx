import { AOProcess, ContractSigner, IO } from '@ar.io/sdk/web';
import { ArweaveAppError } from '@src/utils/errors';
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { useEffectOnce } from '../../hooks/useEffectOnce/useEffectOnce';
import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { ArConnectWalletConnector } from '../../services/wallets';
import { ArweaveWalletConnector, WALLET_TYPES } from '../../types';
import { ARWEAVE_APP_API } from '../../utils/constants';
import eventEmitter from '../../utils/events';
import { dispatchArIOContract } from '../actions/dispatchArIOContract';
import { WalletAction } from '../reducers/WalletReducer';
import { useGlobalState } from './GlobalState';

export type WalletState = {
  walletAddress?: ArweaveTransactionID;
  wallet?: ArweaveWalletConnector;
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
    { arweaveDataProvider, blockHeight, ioTicker, ioProcessId, aoClient },
    dispatchGlobalState,
  ] = useGlobalState();

  const { walletAddress, wallet } = state;

  useEffect(() => {
    if (!walletAddress) {
      wallet?.disconnect();
      return;
    }
    dispatchArIOContract({
      contract: IO.init({
        process: new AOProcess({
          processId: ioProcessId,
          ao: aoClient,
        }),
        signer: wallet?.arconnectSigner as ContractSigner,
      }),
      ioProcessId,
      dispatch: dispatchGlobalState,
    });

    const removeWalletState = () => {
      if (walletAddress) {
        eventEmitter.emit(
          'error',
          new ArweaveAppError(
            'Arweave.app disconnected unexpectedly, please reconnect. You may need to keep the popup open to stay connected.',
          ),
        );
        dispatchWalletState({
          type: 'setWalletAddress',
          payload: undefined,
        });
        dispatchWalletState({
          type: 'setWallet',
          payload: undefined,
        });
      }
    };

    ARWEAVE_APP_API.on('disconnect', removeWalletState);

    return () => ARWEAVE_APP_API.off('disconnect', removeWalletState);
  }, [walletAddress, wallet, aoClient]);

  useEffect(() => {
    if (!Object.keys(state.balances).includes(ioTicker)) {
      const { ar, ...ioFee } = state.balances;
      dispatchWalletState({
        type: 'setBalances',
        payload: { ar, [ioTicker]: Object.values(ioFee)[0] },
      });
    }
  }, [ioTicker]);

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
        arweaveDataProvider.getTokenBalance(address),
        arweaveDataProvider.getArBalance(address),
      ]);

      dispatchWalletState({
        type: 'setBalances',
        payload: {
          [ioTicker]: ioBalance,
          ar: arBalance,
        },
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  async function updateIfConnected() {
    const walletType = window.localStorage.getItem('walletType');

    try {
      if (walletType === WALLET_TYPES.ARCONNECT) {
        const connector = new ArConnectWalletConnector();
        const address = await connector?.getWalletAddress();
        await connector.updatePermissions();

        dispatchWalletState({
          type: 'setWalletAddress',
          payload: address,
        });
        dispatchWalletState({
          type: 'setWallet',
          payload: connector,
        });
      }
    } catch (error) {
      eventEmitter.emit('error', error);
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
