import { AOProcess, ARIO } from '@ar.io/sdk/web';
import { ArweaveAppError } from '@src/utils/errors';
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { useAccount, useConfig } from 'wagmi';

import { useEffectOnce } from '../../hooks/useEffectOnce/useEffectOnce';
import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import {
  ArConnectWalletConnector,
  EthWalletConnector,
} from '../../services/wallets';
import { AoAddress, ArNSWalletConnector, WALLET_TYPES } from '../../types';
import { ARWEAVE_APP_API } from '../../utils/constants';
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
    { arweaveDataProvider, blockHeight, arioTicker, arioProcessId, aoClient },
    dispatchGlobalState,
  ] = useGlobalState();

  const { walletAddress, wallet } = state;

  const config = useConfig();
  const ethAccount = useAccount();

  useEffect(() => {
    if (!walletAddress) {
      wallet?.disconnect();
      return;
    }

    dispatchArIOContract({
      contract: ARIO.init({
        process: new AOProcess({
          processId: arioProcessId,
          ao: aoClient,
        }),
        signer: wallet!.contractSigner!,
      }),
      arioProcessId,
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
    if (!Object.keys(state.balances).includes(arioTicker)) {
      const { ar, ...ioFee } = state.balances;
      dispatchWalletState({
        type: 'setBalances',
        payload: { ar, [arioTicker]: Object.values(ioFee)[0] },
      });
    }
  }, [arioTicker]);

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
      updateBalances(walletAddress, arioTicker);
    }
  }, [walletAddress, blockHeight, arioTicker]);

  async function updateBalances(address: AoAddress, arioTicker: string) {
    try {
      const [arioBalance, arBalance] = await Promise.all([
        arweaveDataProvider.getTokenBalance(address),
        address instanceof ArweaveTransactionID
          ? arweaveDataProvider.getArBalance(address)
          : Promise.resolve(0),
      ]);

      dispatchWalletState({
        type: 'setBalances',
        payload: {
          [arioTicker]: arioBalance,
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
      } else if (ethAccount || walletType === WALLET_TYPES.ETHEREUM) {
        if (ethAccount?.isConnected && ethAccount?.address) {
          const connector = new EthWalletConnector(config);

          dispatchWalletState({
            type: 'setWalletAddress',
            payload: ethAccount.address,
          });
          dispatchWalletState({
            type: 'setWallet',
            payload: connector,
          });
        }
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
