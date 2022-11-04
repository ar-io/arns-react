import React, { createContext, Dispatch, useContext, useReducer } from 'react';
import type { ArNSContractState } from '../types';
import type { Action } from './reducer';
import testContractState from '../../data/contracts/bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U.json';

export type GlobalState = {
  arnsSourceContract: ArNSContractState;
  gateway: string;
  connectedWallet: string;
  errors: Array<Error>;
};

const initialState: GlobalState = {
  arnsSourceContract: testContractState,
  gateway: 'arweave.net',
  connectedWallet: '',
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
