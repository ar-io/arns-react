import Arweave from 'arweave';
import React, { Dispatch, createContext, useContext, useReducer } from 'react';

import { ArweaveGraphQLAPI } from '../../types';
import type { ArNSContractState, ArweaveWalletConnector } from '../../types';
import type { Action } from '../reducers/GlobalReducer';

export type GlobalState = {
  arweave: Arweave;
  arnsSourceContract: ArNSContractState;
  gateway: string;
  walletAddress?: string;
  wallet?: ArweaveWalletConnector & ArweaveGraphQLAPI;
  arnsContractId: string;
  showConnectWallet: boolean;
  errors: Array<Error>;
  notifications: { id: string; text: string }[];
};

const initialState: GlobalState = {
  arweave: new Arweave({
    host: 'arweave.dev',
    protocol: 'https',
  }),
  arnsContractId: 'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U',
  arnsSourceContract: {
    records: {},
    fees: {},
    balances: { '': 0 },
    controllers: [],
    evolve: undefined,
    name: '',
    owner: '',
    ticker: '',
    approvedANTSourceCodeTxs: [],
  },
  gateway: 'arweave.dev',
  walletAddress: undefined,
  showConnectWallet: false,
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
