import {
  AoANTHandler,
  AoANTState,
  AoArNSNameData,
  ArNSEventEmitter,
} from '@ar.io/sdk/web';
import { connect } from '@permaweb/aoconnect';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { dispatchArNSUpdate } from '../actions/dispatchArNSUpdate';
import { ArNSAction } from '../reducers/ArNSReducer';
import { defaultArIO, useGlobalState } from './GlobalState';
import { useWalletState } from './WalletState';

export type ArNSState = {
  domains: Record<string, AoArNSNameData>;
  ants: Record<
    string,
    {
      state: AoANTState | null;
      handlers: AoANTHandler[] | null;
      errors?: Error[];
    }
  >;
  loading: boolean;
  percentLoaded: number;
  antCount: number;
  arnsEmitter: ArNSEventEmitter;
};

export type ArNSStateProviderProps = {
  reducer: React.Reducer<ArNSState, ArNSAction>;
  children: React.ReactNode;
};

export const initialArNSState: ArNSState = {
  arnsEmitter: new ArNSEventEmitter({
    contract: defaultArIO,
    timeoutMs: 1000 * 60 * 5,
    strict: false,
    antAoClient: connect(NETWORK_DEFAULTS.AO.ANT),
  }),
  domains: {},
  ants: {},
  loading: false,
  /**
   * percent loaded is a function of ant count and evaluated ants.
   */
  percentLoaded: 0,
  antCount: 0,
};

export const ArNSStateContext = createContext<
  [ArNSState, Dispatch<ArNSAction>]
>([initialArNSState, () => initialArNSState]);

export const useArNSState = (): [ArNSState, Dispatch<ArNSAction>] =>
  useContext(ArNSStateContext);

/** Create provider to wrap app in */
export function ArNSStateProvider({
  reducer,
  children,
}: ArNSStateProviderProps): JSX.Element {
  const [{ arioContract, arioProcessId, antAoClient, aoNetwork }] =
    useGlobalState();
  const [state, dispatchArNSState] = useReducer(reducer, initialArNSState);
  const [{ walletAddress }] = useWalletState();

  useEffect(() => {
    dispatchArNSState({
      type: 'setArNSEmitter',
      payload: new ArNSEventEmitter({
        contract: arioContract,
        timeoutMs: 1000 * 60 * 5,
        strict: false,
        antAoClient: antAoClient,
      }),
    });
  }, [arioContract, antAoClient]);

  useEffect(() => {
    if (!walletAddress) return;
    dispatchArNSUpdate({
      dispatch: dispatchArNSState,
      walletAddress: walletAddress,
      arioProcessId: arioProcessId,
      aoNetworkSettings: aoNetwork,
    });
  }, [walletAddress, aoNetwork, arioProcessId]);

  return (
    <ArNSStateContext.Provider value={[state, dispatchArNSState]}>
      {children}
    </ArNSStateContext.Provider>
  );
}
