import { AOProcess, ARIO } from '@ar.io/sdk/web';
import { ArweaveAppError, BeaconError } from '@src/utils/errors';
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
  BeaconWalletConnector,
  EthWalletConnector,
  WanderWalletConnector,
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
  const walletType = window.localStorage.getItem('walletType');
  const [state, dispatchWalletState] = useReducer(reducer, initialState);

  const [
    {
      arweaveDataProvider,
      blockHeight,
      arioTicker,
      arioProcessId,
      aoClient,
      turboNetwork,
    },
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
        paymentUrl: turboNetwork.PAYMENT_URL,
        process: new AOProcess({
          processId: arioProcessId,
          ao: aoClient,
        }),
        signer: wallet!.turboSigner!,
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
          type: 'setWalletAndAddress',
          payload: {
            wallet: undefined,
            walletAddress: undefined,
          },
        });
      }
    };

    const removeWalletStateBeacon = () => {
      if (walletAddress) {
        localStorage.removeItem('walletType');
        eventEmitter.emit('error', new BeaconError('Beacon disconnected'));
        dispatchWalletState({
          type: 'setWalletAndAddress',
          payload: {
            wallet: undefined,
            walletAddress: undefined,
          },
        });
      }
    };

    if (walletType === WALLET_TYPES.BEACON) {
      state?.wallet?.on!('disconnected', removeWalletStateBeacon);
    }
    ARWEAVE_APP_API.on('disconnect', removeWalletState);

    return () => {
      ARWEAVE_APP_API.off('disconnect', removeWalletState);
      if (walletType === WALLET_TYPES.BEACON) {
        state?.wallet?.off!('disconnected', removeWalletStateBeacon);
      }
    };
  }, [walletAddress, wallet, aoClient]);

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
      if (walletType === WALLET_TYPES.WANDER) {
        const connector = new WanderWalletConnector();
        const address = await connector?.getWalletAddress();
        await connector.updatePermissions();

        dispatchWalletState({
          type: 'setWalletAndAddress',
          payload: {
            wallet: connector,
            walletAddress: address,
          },
        });
      } else if (walletType === WALLET_TYPES.ETHEREUM) {
        if (
          ethAccount?.isConnected &&
          ethAccount?.address &&
          ethAccount?.connector
        ) {
          const walletConnector = new EthWalletConnector(
            config,
            ethAccount.connector,
          );

          dispatchWalletState({
            type: 'setWalletAndAddress',
            payload: {
              wallet: walletConnector,
              walletAddress: ethAccount.address,
            },
          });
        }
      } else if (walletType === WALLET_TYPES.BEACON) {
        const connector = new BeaconWalletConnector();
        if (!connector._wallet.uid) {
          localStorage.removeItem('walletType');
          eventEmitter.emit('error', new BeaconError('Beacon disconnected'));
          dispatchWalletState({
            type: 'setWalletAndAddress',
            payload: {
              wallet: undefined,
              walletAddress: undefined,
            },
          });
          return;
        }
        const address = await connector?.getWalletAddress();

        dispatchWalletState({
          type: 'setWalletAndAddress',
          payload: {
            wallet: connector,
            walletAddress: address,
          },
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

  useEffect(() => {
    if (
      walletAddress &&
      ethAccount.address !== walletAddress &&
      ethAccount.isConnected &&
      wallet instanceof EthWalletConnector
    ) {
      updateIfConnected();
    }
  }, [ethAccount, wallet, walletAddress]);

  // Handle external Ethereum wallet disconnection (when user disconnects from wallet extension)
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

  // Auto-reconnect Ethereum wallet on page load when wagmi restores the session
  // This mirrors the arweaveWalletLoaded event behavior for Arweave wallets
  useEffect(() => {
    const storedWalletType = window.localStorage.getItem('walletType');
    if (
      storedWalletType === WALLET_TYPES.ETHEREUM &&
      ethAccount.isConnected &&
      ethAccount.address &&
      ethAccount.connector &&
      !wallet
    ) {
      updateIfConnected();
    }
  }, [
    ethAccount.isConnected,
    ethAccount.address,
    ethAccount.connector,
    wallet,
  ]);

  return (
    <WalletStateContext.Provider value={[state, dispatchWalletState]}>
      {children}
    </WalletStateContext.Provider>
  );
}
