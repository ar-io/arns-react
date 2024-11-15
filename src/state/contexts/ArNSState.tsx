import { AoANTState, AoArNSNameData, ArNSEventEmitter } from '@ar.io/sdk/web';
import { useANTLuaSourceCode } from '@src/hooks/useANTLuaSourceCode';
import { DEFAULT_ANT_LUA_ID } from '@src/utils/constants';
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
  ants: Record<string, AoANTState>;
  loading: boolean;
  percentLoaded: number;
  antCount: number;
  arnsEmitter: ArNSEventEmitter;
  luaSourceTx?: { id: string; tags: { name: string; value: string }[] };
};

export type ArNSStateProviderProps = {
  reducer: React.Reducer<ArNSState, ArNSAction>;
  children: React.ReactNode;
};

export const initialArNSState: ArNSState = {
  arnsEmitter: new ArNSEventEmitter({
    contract: defaultArIO,
    timeoutMs: 1000 * 60 * 5,
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
  const [{ arioContract, ioProcessId }] = useGlobalState();
  const [state, dispatchArNSState] = useReducer(reducer, initialArNSState);
  const [{ walletAddress }] = useWalletState();
  const { data: luaSourceTxRes } = useANTLuaSourceCode(DEFAULT_ANT_LUA_ID);

  useEffect(() => {
    if (luaSourceTxRes?.luaCodeTx) {
      dispatchArNSState({
        type: 'setAntSourceTx',
        payload: luaSourceTxRes.luaCodeTx,
      });
    }
  }, [luaSourceTxRes?.luaCodeTx]);

  useEffect(() => {
    dispatchArNSState({
      type: 'setArNSEmitter',
      payload: new ArNSEventEmitter({
        contract: arioContract,
        timeoutMs: 1000 * 60 * 5,
      }),
    });
  }, [arioContract]);

  useEffect(() => {
    if (!walletAddress) return;
    dispatchArNSUpdate({
      dispatch: dispatchArNSState,
      emitter: state.arnsEmitter,
      walletAddress: walletAddress!,
      ioProcessId: ioProcessId,
    });
  }, [walletAddress, state.arnsEmitter]);

  return (
    <ArNSStateContext.Provider value={[state, dispatchArNSState]}>
      {children}
    </ArNSStateContext.Provider>
  );
}
