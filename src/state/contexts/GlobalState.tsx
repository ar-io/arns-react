import { AoIORead, AoIOWrite, IO, ioDevnetProcessId } from '@ar.io/sdk';
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
  ARNS_REGISTRY_ADDRESS,
  AVERAGE_BLOCK_TIME_MS,
  DEFAULT_ARNS_REGISTRY_STATE,
  DEFAULT_ARWEAVE,
} from '../../utils/constants';
import eventEmitter from '../../utils/events';
import type { GlobalAction } from '../reducers/GlobalReducer';

const defaultArweave = new SimpleArweaveDataProvider(DEFAULT_ARWEAVE);
const defaultArIO = IO.init({
  processId: ioDevnetProcessId,
});

export type GlobalState = {
  ioTicker: string;
  gateway: string;
  arnsContractId: ArweaveTransactionID;
  blockHeight?: number;
  lastBlockUpdateTimestamp?: number;
  arweaveDataProvider: ArweaveCompositeDataProvider;
  arioContract: AoIORead | AoIOWrite;
};

const initialState: GlobalState = {
  arnsContractId: ARNS_REGISTRY_ADDRESS,
  ioTicker: DEFAULT_ARNS_REGISTRY_STATE.ticker,
  gateway: 'arweave.net',
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
export default function GlobalStateProvider({
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
    const updateBlockHeight = () => {
      state.arweaveDataProvider
        .getCurrentBlockHeight()
        .then((newBlockHeight: number) => {
          dispatchGlobalState({
            type: 'setBlockHeight',
            payload: newBlockHeight,
          });
        })
        .catch((error) => eventEmitter.emit('error', error));
    };

    if (!state.blockHeight) {
      updateBlockHeight();
    }

    const blockInterval = setInterval(updateBlockHeight, AVERAGE_BLOCK_TIME_MS); // get block height every 2 minutes or if registry or if wallet changes.

    return () => {
      clearInterval(blockInterval);
    };
  }, []);

  async function updateTicker() {
    try {
      setUpdatingTicker(true);
      const ticker = 'dIO'; // TODO, use contract to get ticker
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
