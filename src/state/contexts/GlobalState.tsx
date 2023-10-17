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
  DEFAULT_ARWEAVE,
  DEFAULT_PDNS_REGISTRY_STATE,
  PDNS_SERVICE_API,
} from '../../utils/constants';
import eventEmitter from '../../utils/events';
import type { GlobalAction } from '../reducers/GlobalReducer';

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

const GlobalStateContext = createContext<[GlobalState, Dispatch<GlobalAction>]>(
  [initialState, () => initialState],
);

export const useGlobalState = (): [GlobalState, Dispatch<GlobalAction>] =>
  useContext(GlobalStateContext);

type StateProviderProps = {
  reducer: React.Reducer<GlobalState, GlobalAction>;
  children: React.ReactNode;
};

/** Create provider to wrap app in */
export default function GlobalStateProvider({
  reducer,
  children,
}: StateProviderProps): JSX.Element {
  const [state, dispatchGlobalState] = useReducer(reducer, initialState);

  useEffect(() => {
    const updateBlockHeight = () => {
      state.arweaveDataProvider
        .getCurrentBlockHeight()
        .then((newBlockHieght: number) => {
          dispatchGlobalState({
            type: 'setBlockHeight',
            payload: newBlockHieght,
          });
        })
        .catch((error) => eventEmitter.emit('error', error));
    };

    if (!state.blockHeight) {
      updateBlockHeight();
    }

    const blockInterval = setInterval(updateBlockHeight, 120000); // get block height every 2 minutes or if registry or if wallet changes.

    return () => {
      clearInterval(blockInterval);
    };
  }, []);

  return (
    <GlobalStateContext.Provider value={[state, dispatchGlobalState]}>
      {children}
    </GlobalStateContext.Provider>
  );
}
