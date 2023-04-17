import Arweave from 'arweave';
import React, { Dispatch, createContext, useContext, useReducer } from 'react';

import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import { WarpDataProvider } from '../../services/arweave/WarpDataProvider';
import { ArweaveTransactionID } from '../../types';
import type {
  ArNSContractJSON,
  ArweaveDataProvider,
  ArweaveWalletConnector,
  SmartweaveDataProvider,
} from '../../types';
import type { Action } from '../reducers/GlobalReducer';

const defaultArweave = new Arweave({
  host: 'arweave.net',
  protocol: 'https',
});

export type GlobalState = {
  arweaveDataProvider: ArweaveDataProvider & SmartweaveDataProvider;
  arnsSourceContract: ArNSContractJSON;
  gateway: string;
  walletAddress?: ArweaveTransactionID;
  wallet?: ArweaveWalletConnector;
  arnsContractId: ArweaveTransactionID;
};

const initialState: GlobalState = {
  arweaveDataProvider: new ArweaveCompositeDataProvider(
    new WarpDataProvider(defaultArweave),
    new SimpleArweaveDataProvider(defaultArweave),
  ),
  arnsContractId: new ArweaveTransactionID(
    'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U',
  ),
  arnsSourceContract: {
    records: {},
    fees: {},
    balances: { '': 0 },
    controllers: [],
    evolve: undefined,
    tiers: {
      history: [],
      current: {},
    },
    name: '',
    owner: undefined,
    ticker: '',
    approvedANTSourceCodeTxs: [],
  },
  gateway: 'arweave.net',
  walletAddress: undefined,
  wallet: undefined,
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
  return (
    <GlobalStateContext.Provider value={[state, dispatchGlobalState]}>
      {children}
    </GlobalStateContext.Provider>
  );
}
