import { AoANTState, AoArNSNameData } from '@ar.io/sdk/web';
import { TransactionEdge } from 'arweave-graphql';
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

export type ANTProcessData = {
  state: AoANTState | null;
  version: number;
  processMeta: TransactionEdge['node'] | null;
  errors?: Error[];
};

export type ArNSState = {
  domains: Record<string, AoArNSNameData>;
  ants: Record<string, ANTProcessData>;
  loading: boolean;
  percentLoaded: number;
  antCount: number;
};

export type ArNSStateProviderProps = {
  reducer: React.Reducer<ArNSState, ArNSAction>;
  children: React.ReactNode;
};

export const initialArNSState: ArNSState = {
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
  const [{ arioProcessId, aoNetwork, hyperbeamUrl, antRegistryProcessId }] =
    useGlobalState();
  const [state, dispatchArNSState] = useReducer(reducer, initialArNSState);
  const [{ walletAddress }] = useWalletState();

  useEffect(() => {
    if (!walletAddress) return;
    dispatchArNSUpdate({
      dispatch: dispatchArNSState,
      walletAddress: walletAddress,
      arioProcessId: arioProcessId,
      antRegistryProcessId: antRegistryProcessId,
      aoNetworkSettings: aoNetwork,
      hyperbeamUrl,
    });
  }, [walletAddress, aoNetwork, arioProcessId, hyperbeamUrl]);

  return (
    <ArNSStateContext.Provider value={[state, dispatchArNSState]}>
      {children}
    </ArNSStateContext.Provider>
  );
}
