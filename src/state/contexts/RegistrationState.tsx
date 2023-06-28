import { Dispatch, createContext, useContext, useReducer } from 'react';

import { PDNTContract } from '../../services/arweave/PDNTContract';
import { ArweaveTransactionID, TRANSACTION_TYPES } from '../../types';
import { RegistrationAction } from '../reducers/RegistrationReducer';

export type RegistrationState = {
  resolvedTxID?: ArweaveTransactionID;
  domain?: string;
  leaseDuration: number;
  pdntContract?: PDNTContract;
  targetID?: ArweaveTransactionID;
  pdntID?: ArweaveTransactionID;
  fee: { ar: number; io: number };
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
  domain: undefined,
  leaseDuration: 1,
  pdntContract: new PDNTContract(),
  fee: { ar: 0, io: 0 },
  pdntID: undefined,
  isRegistered: false,
  stage: 0,
  isSearching: false,
  registrationType: TRANSACTION_TYPES.LEASE,
};

const RegistrationStateContext = createContext<
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

  return (
    <RegistrationStateContext.Provider value={[state, dispatchRegisterState]}>
      {children}
    </RegistrationStateContext.Provider>
  );
}
