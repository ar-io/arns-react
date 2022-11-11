import React, { Dispatch, createContext, useContext, useReducer } from 'react';

import type { ArNSContractState } from '../types';
import type { Action } from './reducer';

export type GlobalState = {
  arnsSourceContract: ArNSContractState;
  gateway: string;
  connectedWallet?: string;
  errors: Array<Error>;
};

const initialState: GlobalState = {
  arnsSourceContract: { records: {} },
  gateway: 'arweave.net',
  connectedWallet: undefined,
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
