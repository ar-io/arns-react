import {
  AOProcess,
  ARIO,
  AoARIORead,
  AoARIOWrite,
  AoClient,
} from '@ar.io/sdk/web';
import { connect } from '@permaweb/aoconnect';
import eventEmitter from '@src/utils/events';
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import {
  AO_CU_URL,
  ARIO_PROCESS_ID,
  ARWEAVE_HOST,
  DEFAULT_ARWEAVE,
  NETWORK_DEFAULTS,
} from '../../utils/constants';
import type { GlobalAction } from '../reducers/GlobalReducer';

export const defaultArweave = new SimpleArweaveDataProvider(DEFAULT_ARWEAVE);
export const defaultArIO = ARIO.init({
  process: new AOProcess({
    processId: ARIO_PROCESS_ID,
    ao: connect({
      CU_URL: AO_CU_URL,
    }),
  }),
});

export type GlobalState = {
  arioTicker: string;
  gateway: string;
  aoNetwork: {
    CU_URL: string;
    MU_URL: string;
    SCHEDULER: string;
  };
  aoClient: AoClient;
  arioProcessId: string;
  blockHeight?: number;
  lastBlockUpdateTimestamp?: number;
  arweaveDataProvider: ArweaveCompositeDataProvider;
  arioContract: AoARIORead | AoARIOWrite;
};

const initialState: GlobalState = {
  arioProcessId: ARIO_PROCESS_ID,
  arioTicker: 'ARIO',
  gateway: ARWEAVE_HOST,
  aoNetwork: NETWORK_DEFAULTS.AO,
  aoClient: connect(NETWORK_DEFAULTS.AO),
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

  useEffect(() => {
    async function updateTicker() {
      try {
        const ticker = (await state.arioContract.getInfo()).Ticker;
        dispatchGlobalState({ type: 'setIoTicker', payload: ticker });
      } catch (error: any) {
        eventEmitter.emit(
          'error',
          new Error(
            'Unable to fetch ticker from network process: ' + error.message,
          ),
        );
      }
    }

    updateTicker();
  }, [state.arioContract]);

  return (
    <GlobalStateContext.Provider value={[state, dispatchGlobalState]}>
      {children}
    </GlobalStateContext.Provider>
  );
}
