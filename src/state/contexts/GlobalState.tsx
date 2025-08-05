import {
  AOProcess,
  ARIO,
  AoARIORead,
  AoARIOWrite,
  AoClient,
} from '@ar.io/sdk/web';
import { NetworkGatewaysProvider } from '@ar.io/wayfinder-core';
import {
  LocalStorageGatewaysProvider,
  WayfinderProvider,
} from '@ar.io/wayfinder-react';
import { connect } from '@permaweb/aoconnect';
import { SETTINGS_STORAGE_KEY } from '@src/hooks';
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
  APP_VERSION,
  ARIO_AO_CU_URL,
  ARIO_PROCESS_ID,
  ARWEAVE_HOST,
  DEFAULT_ARWEAVE,
  NETWORK_DEFAULTS,
} from '../../utils/constants';
import type { GlobalAction } from '../reducers/GlobalReducer';

// Function to load settings from localStorage
function loadSettingsFromStorage(): {
  gateway: string;
  aoNetwork: typeof NETWORK_DEFAULTS.AO;
  turboNetwork: typeof NETWORK_DEFAULTS.TURBO;
  arioProcessId: string;
  hyperbeamUrl?: string;
} | null {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      console.log(
        'Loading settings from localStorage:',
        SETTINGS_STORAGE_KEY,
        settings,
      );

      return {
        gateway: settings.network?.gateway || ARWEAVE_HOST,
        aoNetwork: settings.network?.aoNetwork || NETWORK_DEFAULTS.AO,
        turboNetwork: settings.network?.turboNetwork || NETWORK_DEFAULTS.TURBO,
        arioProcessId: settings.arns?.arioProcessId || ARIO_PROCESS_ID,
        hyperbeamUrl: settings.network?.hyperbeamUrl,
      };
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }

  return null;
}

export const defaultArweave = new SimpleArweaveDataProvider(DEFAULT_ARWEAVE);

// Load saved settings or use defaults
const savedSettings = loadSettingsFromStorage();
const initialGateway = savedSettings?.gateway || ARWEAVE_HOST;
const initialAoNetwork = savedSettings?.aoNetwork || NETWORK_DEFAULTS.AO;
const initialTurboNetwork =
  savedSettings?.turboNetwork || NETWORK_DEFAULTS.TURBO;
const initialArioProcessId = savedSettings?.arioProcessId || ARIO_PROCESS_ID;
const initialHyperbeamUrl = savedSettings?.hyperbeamUrl;

export const defaultArIO = ARIO.init({
  paymentUrl: initialTurboNetwork.PAYMENT_URL,
  process: new AOProcess({
    processId: initialArioProcessId,
    ao: connect({
      CU_URL: ARIO_AO_CU_URL,
      MODE: 'legacy',
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
  hyperbeamUrl?: string;
};

const initialState: GlobalState = {
  arioProcessId: initialArioProcessId,
  arioTicker: 'ARIO',
  gateway: initialGateway,
  aoNetwork: initialAoNetwork,
  turboNetwork: initialTurboNetwork,
  aoClient: connect({
    ...initialAoNetwork.ARIO,
    GATEWAY_URL: 'https://' + initialGateway,
  }),
  antAoClient: connect({
    ...initialAoNetwork.ANT,
    GATEWAY_URL: 'https://' + initialGateway,
  }),
  hyperbeamUrl: initialHyperbeamUrl,
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
      {/* Wrap global state in wayfinder provider */}
      <WayfinderProvider
        gatewaysProvider={
          new LocalStorageGatewaysProvider({
            gatewaysProvider: new NetworkGatewaysProvider({
              ario: state.arioContract,
            }),
          })
        }
        telemetrySettings={{
          enabled: true,
          clientName: 'arns-app',
          clientVersion: APP_VERSION,
          sampleRate: 1,
        }}
      >
        {children}
      </WayfinderProvider>
    </GlobalStateContext.Provider>
  );
}
