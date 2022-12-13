import React, { Dispatch, createContext, useContext, useReducer } from 'react';

import type { ArNSContractState, ArweaveWalletConnector } from '../types';
import type { Action } from './reducer';

export type GlobalState = {
  arnsSourceContract: ArNSContractState;
  gateway: string;
  walletAddress?: string;
  wallet?: ArweaveWalletConnector;
  showConnectWallet: boolean;
  errors: Array<Error>;
};

const initialState: GlobalState = {
  arnsSourceContract: { records: {}, fees: {} },
  gateway: 'arweave.dev',
  walletAddress: undefined,
  showConnectWallet: false,
  wallet: undefined,
  errors: [],
};

const GlobalStateContext = createContext<[GlobalState, Dispatch<Action>]>([
  initialState,
  () => initialState,
]);

export const useStateValue = (): [GlobalState, Dispatch<Action>] =>
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
