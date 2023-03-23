import Arweave from 'arweave';
import React, { Dispatch, createContext, useContext, useReducer } from 'react';

import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import { WarpDataProvider } from '../../services/arweave/WarpDataProvider';
import { ArweaveTransactionID } from '../../types';
import type {
  ArNSContractState,
  ArweaveDataProvider,
  ArweaveWalletConnector,
  SmartweaveDataProvider,
} from '../../types';
import { ARNS_REGISTRY_ID } from '../../utils/constants';
import type { Action } from '../reducers/GlobalReducer';

const defaultArweave = new Arweave({
  host: 'arweave.net',
  protocol: 'https',
});

export type GlobalState = {
  arweaveDataProvider: ArweaveDataProvider & SmartweaveDataProvider;
  arnsSourceContract: ArNSContractState;
  gateway: string;
  walletAddress?: ArweaveTransactionID;
  wallet?: ArweaveWalletConnector;
  arnsContractId: ArweaveTransactionID;
  errors: Array<Error>;
  notifications: { id: string; text: string }[];
};

const initialState: GlobalState = {
  arweaveDataProvider: new ArweaveCompositeDataProvider(
    new WarpDataProvider(defaultArweave),
    new SimpleArweaveDataProvider(defaultArweave),
  ),
  arnsContractId: new ArweaveTransactionID(ARNS_REGISTRY_ID),
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
  errors: [],
  notifications: [],
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
