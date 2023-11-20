import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { PDNTContract } from '../../services/arweave/PDNTContract';
import { TRANSACTION_TYPES } from '../../types';
import { RegistrationAction } from '../reducers/RegistrationReducer';
import { useGlobalState } from './GlobalState';

export type RegistrationState = {
  resolvedTxID?: ArweaveTransactionID;
  domain: string;
  leaseDuration: number;
  pdntContract?: PDNTContract;
  targetID?: ArweaveTransactionID;
  antID?: ArweaveTransactionID;
  fee: { ar: number; [x: string]: number | undefined };
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
  pdntContract: new PDNTContract(),
  fee: { ar: 0, ['Test IO']: 0 },
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
export default function RegistrationStateProvider({
  reducer,
  children,
}: RegistrationStateProviderProps): JSX.Element {
  const [state, dispatchRegisterState] = useReducer(
    reducer,
    initialRegistrationState,
  );
  const [{ ioTicker }] = useGlobalState();

  useEffect(() => {
    if (!Object.keys(state.fee).includes(ioTicker)) {
      const { ar, ...ioFee } = state.fee;
      dispatchRegisterState({
        type: 'setFee',
        payload: { ar, [ioTicker]: Object.values(ioFee)[0] },
      });
    }
  }, [ioTicker]);

  return (
    <RegistrationStateContext.Provider value={[state, dispatchRegisterState]}>
      {children}
    </RegistrationStateContext.Provider>
  );
}
