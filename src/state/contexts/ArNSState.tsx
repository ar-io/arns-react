import { AoANTState, AoArNSNameData, ArNSEventEmitter } from '@ar.io/sdk/web';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { dispatchArNSUpdate } from '../actions/dispatchArNSUpdate';
import { ArNSAction } from '../reducers/ArNSReducer';
import { useGlobalState } from './GlobalState';
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
  const [{ arioContract }] = useGlobalState();
  const [state, dispatchArNSState] = useReducer(reducer, initialArNSState);
  const [{ walletAddress }] = useWalletState();
  const queryClient = useQueryClient();

  useEffect(() => {
    dispatchArNSState({
      type: 'setArNSEmitter',
      payload: new ArNSEventEmitter({
        timeoutMs: 10000,
        contract: arioContract,
      }),
    });
  }, [arioContract]);

  useEffect(() => {
    if (!walletAddress) return;
    dispatchArNSUpdate({
      dispatch: dispatchArNSState,
      emitter: state.arnsEmitter,
      queryClient,
      walletAddress: walletAddress!,
    });
  }, [walletAddress, state.arnsEmitter]);

  return (
    <ArNSStateContext.Provider value={[state, dispatchArNSState]}>
      {children}
    </ArNSStateContext.Provider>
  );
}
