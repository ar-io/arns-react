import { Dispatch, createContext, useContext, useReducer } from 'react';

import { PDNTContract } from '../../services/arweave/PDNTContract';
import { ArweaveTransactionID } from '../../types';
import { RegistrationAction } from '../reducers/RegistrationReducer';

export type RegistrationState = {
  resolvedTxID?: ArweaveTransactionID;
  domain: string;
  leaseDuration: number;
  tier: number;
  pdntContract?: PDNTContract;
  nickname?: string;
  ticker?: string;
  controllers: Array<ArweaveTransactionID>;
  ttl: number;
  targetID?: ArweaveTransactionID;
  owner?: ArweaveTransactionID;
  pdntID?: ArweaveTransactionID;
  fee: { ar: number; io: number };
  isRegistered: boolean;
  stage: number;
  isSearching: boolean;
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
  tier: 1,
  controllers: [],
  ttl: 100,
  fee: { ar: 0, io: 0 },
  pdntID: undefined,
  isRegistered: false,
  stage: 0,
  isSearching: false,
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
