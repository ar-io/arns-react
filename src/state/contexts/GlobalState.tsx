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
  ARIO_AO_CU_URL,
  ARIO_PROCESS_ID,
  ARWEAVE_HOST,
  DEFAULT_ARWEAVE,
  NETWORK_DEFAULTS,
} from '../../utils/constants';
import type { GlobalAction } from '../reducers/GlobalReducer';

export const defaultArweave = new SimpleArweaveDataProvider(DEFAULT_ARWEAVE);
export const defaultArIO = ARIO.init({
  paymentUrl: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
  process: new AOProcess({
    processId: ARIO_PROCESS_ID,
    ao: connect({
      CU_URL: ARIO_AO_CU_URL,
    }),
  }),
});

export type GlobalState = {
  arioTicker: string;
  gateway: string;
  aoNetwork: typeof NETWORK_DEFAULTS.AO;
  turboNetwork: typeof NETWORK_DEFAULTS.TURBO;
  aoClient: AoClient;
  antAoClient: AoClient;
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
  turboNetwork: NETWORK_DEFAULTS.TURBO,
  aoClient: connect(NETWORK_DEFAULTS.AO.ARIO),
  antAoClient: connect(NETWORK_DEFAULTS.AO.ANT),
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
