import Arweave from 'arweave';
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { PDNSContractCache } from '../../services/arweave/PDNSContractCache';
import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import { WarpDataProvider } from '../../services/arweave/WarpDataProvider';
import { ArweaveTransactionID } from '../../types';
import type { ArweaveWalletConnector, PDNSContractJSON } from '../../types';
import {
  ARNS_REGISTRY_ADDRESS,
  DEFAULT_PDNS_REGISTRY_STATE,
} from '../../utils/constants';
import eventEmitter from '../../utils/events';
import type { Action } from '../reducers/GlobalReducer';

const PDNS_SERVICE_API =
  process.env.VITE_ARNS_SERVICE_API ?? 'https://dev.arns.app';
const ARWEAVE_HOST = process.env.VITE_ARWEAVE_HOST ?? 'ar-io.dev';

const DEFAULT_ARWEAVE = new Arweave({
  host: ARWEAVE_HOST,
  protocol: 'https',
});
const defaultWarp = new WarpDataProvider(DEFAULT_ARWEAVE);
const defaultArweave = new SimpleArweaveDataProvider(DEFAULT_ARWEAVE);
const defaultContractCache = [
  new PDNSContractCache({ url: PDNS_SERVICE_API, arweave: defaultArweave }),
];

export type GlobalState = {
  pdnsSourceContract: PDNSContractJSON;
  gateway: string;
  walletAddress?: ArweaveTransactionID;
  wallet?: ArweaveWalletConnector;
  // TODO: assess need for this in the global state
  balances: {
    ar: number;
    io: number;
  };
  pdnsContractId: ArweaveTransactionID;
  blockHeight?: number;
  arweaveDataProvider: ArweaveCompositeDataProvider;
};

const initialState: GlobalState = {
  pdnsContractId: new ArweaveTransactionID(ARNS_REGISTRY_ADDRESS),
  pdnsSourceContract: DEFAULT_PDNS_REGISTRY_STATE,
  gateway: 'ar-io.dev',
  walletAddress: undefined,
  wallet: undefined,
  balances: {
    ar: 0,
    io: 0,
  },
  blockHeight: undefined,
  arweaveDataProvider: new ArweaveCompositeDataProvider(
    defaultArweave,
    defaultWarp,
    defaultContractCache,
  ),
};

const GlobalStateContext = createContext<[GlobalState, Dispatch<Action>]>([
  initialState,
  () => initialState,
]);

export const useGlobalState = (): [GlobalState, Dispatch<Action>] =>
  useContext(GlobalStateContext);

type StateProviderProps = {
  reducer: React.Reducer<GlobalState, Action>;
  children: React.ReactNode;
};

/** Create provider to wrap app in */
export default function GlobalStateProvider({
  reducer,
  children,
}: StateProviderProps): JSX.Element {
  const [state, dispatchGlobalState] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatchNewArweave(state.gateway);
  }, [state.gateway]);

  useEffect(() => {
    const blockInterval = setInterval(() => {
      state.arweaveDataProvider
        .getCurrentBlockHeight()
        .then((newBlockHieght: number) => {
          if (newBlockHieght === state.blockHeight) {
            return;
          }
          dispatchGlobalState({
            type: 'setBlockHeight',
            payload: newBlockHieght,
          });
        })
        .catch((error) => eventEmitter.emit('error', error));
    }, 120000); // get block height every 2 minutes or if registry or if wallet changes.

    return () => {
      clearInterval(blockInterval);
    };
  }, []);

  async function dispatchNewArweave(gateway: string): Promise<void> {
    try {
      const arweave = new Arweave({
        host: gateway,
        protocol: 'https',
      });

      const warpDataProvider = new WarpDataProvider(arweave);
      const arweaveDataProvider = new SimpleArweaveDataProvider(arweave);
      const contractCacheProviders = [
        new PDNSContractCache({
          url: PDNS_SERVICE_API,
          arweave: arweaveDataProvider,
        }),
      ];

      const arweaveCompositeDataProvider = new ArweaveCompositeDataProvider(
        arweaveDataProvider,
        warpDataProvider,
        contractCacheProviders,
      );
      const blockHeight =
        await arweaveCompositeDataProvider.getCurrentBlockHeight();
      dispatchGlobalState({
        type: 'setBlockHeight',
        payload: blockHeight,
      });
      dispatchGlobalState({
        type: 'setArweaveDataProvider',
        payload: arweaveCompositeDataProvider,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  return (
    <GlobalStateContext.Provider value={[state, dispatchGlobalState]}>
      {children}
    </GlobalStateContext.Provider>
  );
}
