import { ARIO, AoARIORead, AoARIOWrite } from '@ar.io/sdk/web';
import eventEmitter from '@src/utils/events';
import {
  type SolanaNetworkConfig,
  getActiveSolanaConfig,
  getSolanaRpc,
} from '@src/utils/solana';
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import { DEFAULT_ARWEAVE, NETWORK_DEFAULTS } from '../../utils/constants';
import type { GlobalAction } from '../reducers/GlobalReducer';

const SETTINGS_KEY = 'arns-app-settings';

function loadSettingsFromStorage(): {
  gateway: string;
  turboNetwork: typeof NETWORK_DEFAULTS.TURBO;
} | null {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);

    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      console.log(
        'Loading settings from localStorage:',
        SETTINGS_KEY,
        settings,
      );

      return {
        gateway: settings.network?.gateway || NETWORK_DEFAULTS.ARNS.HOST,
        turboNetwork: settings.network?.turboNetwork || NETWORK_DEFAULTS.TURBO,
      };
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }

  return null;
}

export const defaultArweave = new SimpleArweaveDataProvider(DEFAULT_ARWEAVE);

const savedSettings = loadSettingsFromStorage();
const initialGateway = savedSettings?.gateway || NETWORK_DEFAULTS.ARNS.HOST;
const initialTurboNetwork =
  savedSettings?.turboNetwork || NETWORK_DEFAULTS.TURBO;

function buildProgramIds(config: SolanaNetworkConfig) {
  const ids: Record<string, any> = {};
  if (config.programIds.coreProgramId)
    ids.coreProgramId = config.programIds.coreProgramId;
  if (config.programIds.garProgramId)
    ids.garProgramId = config.programIds.garProgramId;
  if (config.programIds.arnsProgramId)
    ids.arnsProgramId = config.programIds.arnsProgramId;
  if (config.programIds.antProgramId)
    ids.antProgramId = config.programIds.antProgramId;
  return ids;
}

export function buildDefaultArIO(config?: SolanaNetworkConfig) {
  const solConfig = config ?? getActiveSolanaConfig();
  return ARIO.init({
    backend: 'solana',
    rpc: getSolanaRpc(),
    ...buildProgramIds(solConfig),
  });
}

export const defaultArIO = buildDefaultArIO();

export type GlobalState = {
  arioTicker: string;
  gateway: string;
  turboNetwork: typeof NETWORK_DEFAULTS.TURBO;
  blockHeight?: number;
  lastBlockUpdateTimestamp?: number;
  /**
   * Arweave-only data provider used for tx-id validation, block-height
   * polling, AR-price lookups, and (legacy) ANT record discovery via
   * GraphQL. Stays Arweave-bound — the AR.IO Solana protocol still uses
   * Arweave TX IDs as content-target identifiers.
   */
  arweaveDataProvider: SimpleArweaveDataProvider;
  arioContract: AoARIORead | AoARIOWrite;
  solanaConfig: SolanaNetworkConfig;
};

const initialState: GlobalState = {
  arioTicker: 'ARIO',
  gateway: initialGateway,
  turboNetwork: initialTurboNetwork,
  blockHeight: undefined,
  lastBlockUpdateTimestamp: undefined,
  arweaveDataProvider: defaultArweave,
  arioContract: defaultArIO,
  solanaConfig: getActiveSolanaConfig(),
};

const GlobalStateContext = createContext<[GlobalState, Dispatch<GlobalAction>]>(
  [initialState, () => initialState],
);

export const useGlobalState = (): [GlobalState, Dispatch<GlobalAction>] =>
  useContext(GlobalStateContext);

type StateProviderProps = {
  reducer: React.Reducer<GlobalState, GlobalAction>;
  children: React.ReactNode;
  arweaveDataProvider?: SimpleArweaveDataProvider;
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
