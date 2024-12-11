import { AoANTRead } from '@ar.io/sdk/web';
import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { TRANSACTION_TYPES } from '../../types';
import { RegistrationAction } from '../reducers/RegistrationReducer';
import { useGlobalState } from './GlobalState';

export type RegistrationState = {
  resolvedTxID?: ArweaveTransactionID;
  domain: string;
  leaseDuration: number;
  antContract?: AoANTRead;
  targetID?: ArweaveTransactionID;
  antID?: ArweaveTransactionID;
  fee: { ar: number; [x: string]: number | undefined };
  targetId?: ArweaveTransactionID;
  isRegistered: boolean;
  stage: number;
  isSearching: boolean;
  registrationType: TRANSACTION_TYPES;
};

export type RegistrationStateProviderProps = {
  reducer: React.Reducer<RegistrationState, RegistrationAction>;
  children: React.ReactNode;
};

export const initialRegistrationState: RegistrationState = {
  resolvedTxID: undefined,
  domain: '',
  leaseDuration: 1,
  antContract: undefined,
  fee: { ar: 0, ['tIO']: 0 },
  antID: undefined,
  isRegistered: false,
  stage: 0,
  isSearching: false,
  registrationType: TRANSACTION_TYPES.LEASE,
};

export const RegistrationStateContext = createContext<
  [RegistrationState, Dispatch<RegistrationAction>]
>([initialRegistrationState, () => initialRegistrationState]);

export const useRegistrationState = (): [
  RegistrationState,
  Dispatch<RegistrationAction>,
] => useContext(RegistrationStateContext);

/** Create provider to wrap app in */
export function RegistrationStateProvider({
  reducer,
  children,
}: RegistrationStateProviderProps): JSX.Element {
  const [state, dispatchRegisterState] = useReducer(
    reducer,
    initialRegistrationState,
  );
  const [{ arioTicker }] = useGlobalState();

  useEffect(() => {
    if (!Object.keys(state.fee).includes(arioTicker)) {
      const { ar, ...ioFee } = state.fee;
      dispatchRegisterState({
        type: 'setFee',
        payload: { ar, [arioTicker]: Object.values(ioFee)[0] },
      });
    }
  }, [arioTicker, state.fee]);

  return (
    <RegistrationStateContext.Provider value={[state, dispatchRegisterState]}>
      {children}
    </RegistrationStateContext.Provider>
  );
}
