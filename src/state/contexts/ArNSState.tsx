import {
  ANT,
  AoANTState,
  AoArNSNameData,
  ArNSEventEmitter,
} from '@ar.io/sdk/web';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { ArNSAction } from '../reducers/ArNSReducer';
import { useWalletState } from './WalletState';

export type ArNSState = {
  domains: Record<string, AoArNSNameData>;
  ants: Record<string, AoANTState>;
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
  arnsEmitter: new ArNSEventEmitter({ timeoutMs: 10000 }),
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
export default function ArNSStateProvider({
  reducer,
  children,
}: ArNSStateProviderProps): JSX.Element {
  const [state, dispatchArNSState] = useReducer(reducer, initialArNSState);
  const [{ walletAddress }] = useWalletState();
  const queryClient = useQueryClient();

  useEffect(() => {
    const arnsEmitter = state.arnsEmitter;
    arnsEmitter.on('process', (id, process) => {
      queryClient.setQueryData(['ant', id], () => {
        const ant = ANT.init({ processId: id });
        return ant.getState();
      });
      dispatchArNSState({
        type: 'addDomains',
        payload: process.names,
      });
      dispatchArNSState({
        type: 'addAnts',
        payload: { [id]: process.state },
      });
    });
    arnsEmitter.on('progress', (itemIndex, totalIds) => {
      dispatchArNSState({
        type: 'incrementAntCount',
      });
      dispatchArNSState({
        type: 'setPercentLoaded',
        payload: totalIds,
      });
    });
    arnsEmitter.on('end', (ids: string[]) => {
      dispatchArNSState({
        type: 'setLoading',
        payload: false,
      });
      dispatchArNSState({
        type: 'setPercentLoaded',
        payload: undefined,
      });
      queryClient.setQueryData(['ant-ids', walletAddress], () => [...ids]);
    });
    // initial load of assets
    if (walletAddress && !state.loading && !Object.keys(state.domains).length) {
      dispatchArNSState({
        type: 'setLoading',
        payload: true,
      });
      arnsEmitter.fetchProcessesOwnedByWallet({
        address: walletAddress.toString(),
      });
    }

    return () => {
      arnsEmitter.removeAllListeners();
    };
  }, [walletAddress]);

  return (
    <ArNSStateContext.Provider value={[state, dispatchArNSState]}>
      {children}
    </ArNSStateContext.Provider>
  );
}
