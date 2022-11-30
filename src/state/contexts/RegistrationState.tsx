import React, { Dispatch, createContext, useContext, useReducer } from 'react';

import { ArweaveTransactionId } from '../../types';
import { RegistrationAction } from '../reducers/RegistrationReducer';
import { registrationReducer } from '../reducers/RegistrationReducer';

export type RegistrationState = {
  domain: string;
  leaseDuration: number;
  tier: number;
  nickname?: string;
  ticker?: string;
  controllers: Array<ArweaveTransactionId>;
  ttl: number;
  antID?: ArweaveTransactionId;
  fee: { ar: number; io: number };
  isRegistering: boolean;
  isRegistered: boolean;
  stage: number;
  errors?: Array<Error>;
};

export const initialRegistrationState: RegistrationState = {
  domain: '',
  leaseDuration: 1,
  tier: 1,
  controllers: [''],
  ttl: 100,
  fee: { ar: 0, io: 0 },
  isRegistering: false,
  isRegistered: false,
  stage: 0,
};

const RegistrationStateContext = createContext<
  [RegistrationState, Dispatch<RegistrationAction>]
>([initialRegistrationState, () => initialRegistrationState]);

export const useRegistrationState = (): [
  RegistrationState,
  Dispatch<RegistrationAction>,
] => useContext(RegistrationStateContext);

type StateProviderProps = {
  reducer: React.Reducer<RegistrationState, RegistrationAction>;
  children: React.ReactNode;
};

/** Create provider to wrap app in */
export default function RegistrationStateProvider({
  reducer,
  children,
}: StateProviderProps): JSX.Element {
  const [state, dispatchRegisterState] = useReducer(
    registrationReducer,
    initialRegistrationState,
  );
  return (
    <RegistrationStateContext.Provider value={[state, dispatchRegisterState]}>
      {children}
    </RegistrationStateContext.Provider>
  );
}
