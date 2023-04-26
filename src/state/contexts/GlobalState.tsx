import React, { Dispatch, createContext, useContext, useReducer } from 'react';

import { ArweaveTransactionID } from '../../types';
import type { ArweaveWalletConnector, PDNSContractJSON } from '../../types';
import type { Action } from '../reducers/GlobalReducer';

export type GlobalState = {
  pdnsSourceContract: PDNSContractJSON;
  gateway: string;
  walletAddress?: ArweaveTransactionID;
  wallet?: ArweaveWalletConnector;
  pdnsContractId: ArweaveTransactionID;
};

const initialState: GlobalState = {
  pdnsContractId: new ArweaveTransactionID(
    'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U',
  ),
  pdnsSourceContract: {
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
  gateway: 'ar-io.dev',
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
