import { ANTState, ArNSNameData } from '@ar.io/sdk/web';
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
  state: ANTState | null;
  version: number;
  processMeta: TransactionEdge['node'] | null;
  errors?: Error[];
  /**
   * True when the wallet owns this ANT's MPL Core asset on-chain but it is
   * missing from the wallet's ACL (e.g. an out-of-band Metaplex Core
   * transfer). Such ANTs need `syncAcl` to converge their on-chain ACL/
   * ownership state. Surfaced in the manage table and the Sync Ownership flow.
   */
  needsOwnerSync?: boolean;
};

export type ArNSState = {
  domains: Record<string, ArNSNameData>;
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
  const [{ arioContract, solanaConfig }] = useGlobalState();
  const [state, dispatchArNSState] = useReducer(reducer, initialArNSState);
  const [{ walletAddress, wallet }] = useWalletState();

  // Uses `solanaConfig.rpcUrl` instead of `arioContract` as a dependency.
  // `arioContract` changes object identity during wallet connect when
  // WalletState rebuilds it (read-only → writable), which would trigger
  // this effect a second time even though the underlying RPC is the same.
  // `solanaConfig.rpcUrl` is a stable string that only changes when the
  // user switches Solana networks in settings, which is the only case
  // where we actually need to re-fetch domains.
  useEffect(() => {
    if (!walletAddress) return;
    dispatchArNSUpdate({
      dispatch: dispatchArNSState,
      walletAddress: walletAddress,
      wallet,
      arioContract,
    });
  }, [walletAddress, wallet, solanaConfig.rpcUrl]);

  return (
    <ArNSStateContext.Provider value={[state, dispatchArNSState]}>
      {children}
    </ArNSStateContext.Provider>
  );
}
