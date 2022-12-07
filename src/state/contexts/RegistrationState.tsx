import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import {
  ArweaveTransactionId,
  RegistrationAction,
  RegistrationState,
  RegistrationStateProviderProps,
} from '../../types';
import { registrationReducer } from '../reducers/RegistrationReducer';
import { useGlobalState } from './GlobalState';

export const initialRegistrationState: RegistrationState = {
  domain: '',
  leaseDuration: 1,
  chosenTier: 1,
  controllers: [],
  ttl: 100,
  fee: { ar: 0, io: 0 },
  targetID: undefined,
  isRegistering: false,
  isRegistered: false,
  stage: 0,
  isFirstStage: true,
  isLastStage: false,
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
  firstStage,
  lastStage,
}: RegistrationStateProviderProps): JSX.Element {
  const [state, dispatchRegisterState] = useReducer(
    reducer,
    initialRegistrationState,
  );
  const [{ isSearching }, dispatchGlobalState] = useGlobalState();
  useEffect(() => {
    if (!isSearching) {
      dispatchRegisterState({
        type: 'reset',
        payload: initialRegistrationState,
      });
    }
    if (state.stage === lastStage) {
      dispatchRegisterState({
        type: 'setIsLastStage',
        payload: true,
      });
    }
    if (state.stage === firstStage) {
      dispatchRegisterState({
        type: 'setIsFirstStage',
        payload: true,
      });
    }
    if (state.stage !== lastStage && state.stage !== firstStage) {
      dispatchRegisterState({
        type: 'setIsLastStage',
        payload: false,
      });
      dispatchRegisterState({
        type: 'setIsFirstStage',
        payload: false,
      });
    }
  }, [state.stage, isSearching]);

  return (
    <RegistrationStateContext.Provider value={[state, dispatchRegisterState]}>
      {children}
    </RegistrationStateContext.Provider>
  );
}
