import { AOProcess, AoIORead, AoIOWrite, IO } from '@ar.io/sdk/web';
import { connect } from '@permaweb/aoconnect';
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';

import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import {
  AO_CU_URL,
  ARNS_REGISTRY_ADDRESS,
  ARWEAVE_HOST,
  DEFAULT_ARWEAVE,
  IO_PROCESS_ID,
} from '../../utils/constants';
import type { GlobalAction } from '../reducers/GlobalReducer';

export const defaultArweave = new SimpleArweaveDataProvider(DEFAULT_ARWEAVE);
export const defaultArIO = IO.init({
  process: new AOProcess({
    processId: IO_PROCESS_ID,
    ao: connect({
      CU_URL: AO_CU_URL,
    }),
  }),
});

export type GlobalState = {
  ioTicker: string;
  gateway: string;
  ioProcessId: ArweaveTransactionID;
  blockHeight?: number;
  lastBlockUpdateTimestamp?: number;
  arweaveDataProvider: ArweaveCompositeDataProvider;
  arioContract: AoIORead | AoIOWrite;
};

const initialState: GlobalState = {
  ioProcessId: ARNS_REGISTRY_ADDRESS,
  ioTicker: '',
  gateway: ARWEAVE_HOST,
  blockHeight: undefined,
  lastBlockUpdateTimestamp: undefined,
  arweaveDataProvider: new ArweaveCompositeDataProvider({
    arweave: defaultArweave,
    contract: defaultArIO,
  }),
  arioContract: defaultArIO,
};

const GlobalStateContext = createContext<[GlobalState, Dispatch<GlobalAction>]>(
  [initialState, () => initialState],
);

export const useGlobalState = (): [GlobalState, Dispatch<GlobalAction>] =>
  useContext(GlobalStateContext);

type StateProviderProps = {
  reducer: React.Reducer<GlobalState, GlobalAction>;
  children: React.ReactNode;
  arweaveDataProvider?: ArweaveCompositeDataProvider;
};

/** Create provider to wrap app in */
export function GlobalStateProvider({
  reducer,
  children,
  arweaveDataProvider,
}: StateProviderProps): JSX.Element {
  const [state, dispatchGlobalState] = useReducer(
    reducer,
    arweaveDataProvider
      ? { ...initialState, arweaveDataProvider }
      : initialState,
  );
  const [updatingTicker, setUpdatingTicker] = useState(false);

  useEffect(() => {
    if (state.ioTicker === initialState.ioTicker && !updatingTicker) {
      updateTicker();
    }
  }, []);

  async function updateTicker() {
    try {
      setUpdatingTicker(true);
      const ticker = 'tIO'; // TODO, use contract to get ticker
      dispatchGlobalState({ type: 'setIoTicker', payload: ticker });
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingTicker(false);
    }
  }

  return (
    <GlobalStateContext.Provider value={[state, dispatchGlobalState]}>
      {children}
    </GlobalStateContext.Provider>
  );
}
