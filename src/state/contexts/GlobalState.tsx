import React, { Dispatch, createContext, useContext, useReducer } from 'react';

import { ArweaveTransactionID } from '../../types';
import type { ArweaveWalletConnector, PDNSContractJSON } from '../../types';
import { DEFAULT_PDNS_REGISTRY_STATE } from '../../utils/constants';
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
    'GfrHPxXyfuxNNdGvzHl_5HFX711jZsG3OE8qmG-UqlY',
  ),
  pdnsSourceContract: DEFAULT_PDNS_REGISTRY_STATE,
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
