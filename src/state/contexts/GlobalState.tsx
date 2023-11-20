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
import { PDNSContractCache } from '../../services/arweave/PDNSContractCache';
import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import { WarpDataProvider } from '../../services/arweave/WarpDataProvider';
import {
  ARNS_REGISTRY_ADDRESS,
  AVERAGE_BLOCK_TIME_MS,
  DEFAULT_ARWEAVE,
  PDNS_SERVICE_API,
} from '../../utils/constants';
import eventEmitter from '../../utils/events';
import type { GlobalAction } from '../reducers/GlobalReducer';

const defaultWarp = new WarpDataProvider(DEFAULT_ARWEAVE);
const defaultArweave = new SimpleArweaveDataProvider(DEFAULT_ARWEAVE);
const defaultContractCache = new PDNSContractCache({
  url: PDNS_SERVICE_API,
  arweave: defaultArweave,
});

export type GlobalState = {
  ioTicker: string;
  gateway: string;
  pdnsContractId: ArweaveTransactionID;
  blockHeight?: number;
  lastBlockUpdateTimestamp?: number;
  arweaveDataProvider: ArweaveCompositeDataProvider;
};

const initialState: GlobalState = {
  pdnsContractId: ARNS_REGISTRY_ADDRESS,
  ioTicker: 'Test IO',
  gateway: 'ar-io.dev',
  blockHeight: undefined,
  lastBlockUpdateTimestamp: undefined,
  arweaveDataProvider: new ArweaveCompositeDataProvider(
    defaultArweave,
    defaultWarp,
    defaultContractCache,
  ),
};

const GlobalStateContext = createContext<[GlobalState, Dispatch<GlobalAction>]>(
  [initialState, () => initialState],
);

export const useGlobalState = (): [GlobalState, Dispatch<GlobalAction>] =>
  useContext(GlobalStateContext);

type StateProviderProps = {
  reducer: React.Reducer<GlobalState, GlobalAction>;
  children: React.ReactNode;
};

/** Create provider to wrap app in */
export default function GlobalStateProvider({
  reducer,
  children,
}: StateProviderProps): JSX.Element {
  const [state, dispatchGlobalState] = useReducer(reducer, initialState);
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
      const ticker = await state.arweaveDataProvider.getStateField({
        contractTxId: ARNS_REGISTRY_ADDRESS,
        field: 'ticker',
      });
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
