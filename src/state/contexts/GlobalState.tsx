import Arweave from 'arweave';
import React, { Dispatch, createContext, useContext, useReducer } from 'react';

import type { ArNSContractState, ArweaveWalletConnector } from '../../types';
import type { Action } from '../reducers/GlobalReducer';

export type GlobalState = {
  arweave: Arweave;
  arnsSourceContract: ArNSContractState;
  gateway: string;
  walletAddress?: string;
  wallet?: ArweaveWalletConnector;
  arnsContractId: string;
  showConnectWallet: boolean;
  isSearching: boolean;
  errors: Array<Error>;
  notifications: { id: string; text: string }[];
};

const initialState: GlobalState = {
  arweave: new Arweave({
    host: 'arweave.dev',
    protocol: 'https',
  }),
  arnsContractId: 'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U',
  arnsSourceContract: { records: {}, fees: {} },
  gateway: 'arweave.dev',
  walletAddress: undefined,
  showConnectWallet: false,
  wallet: undefined,
  isSearching: false,
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
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GlobalStateContext.Provider value={[state, dispatch]}>
      {children}
    </GlobalStateContext.Provider>
  );
}
