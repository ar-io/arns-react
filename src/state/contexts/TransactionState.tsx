import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import {
  AntInteraction,
  CONTRACT_TYPES,
  ContractType,
  REGISTRY_INTERACTION_TYPES,
  RegistryInteraction,
} from '../../types';
import { TransactionAction } from '../reducers/TransactionReducer';

export type TransactionState = {
  transactionData: { [x: string]: any }; // data that will be used to perform the transaction.
  contractType: ContractType;
  interactionType: AntInteraction | RegistryInteraction;
  workflowStage: number;
};

export type TransactionStateProviderProps = {
  reducer: React.Reducer<TransactionState, TransactionAction>;
  children: React.ReactNode;
};

export const initialTransactionState: TransactionState = {
  transactionData: {},
  contractType: CONTRACT_TYPES.REGISTRY,
  interactionType: REGISTRY_INTERACTION_TYPES.BUY_RECORD,
  workflowStage: 1,
};

const TransactionStateContext = createContext<
  [TransactionState, Dispatch<TransactionAction>]
>([initialTransactionState, () => initialTransactionState]);

export const useTransactionState = (): [
  TransactionState,
  Dispatch<TransactionAction>,
] => useContext(TransactionStateContext);

/** Create provider to wrap app in */
export default function TransactionStateProvider({
  reducer,
  children,
}: TransactionStateProviderProps): JSX.Element {
  const [state, dispatchTransactionState] = useReducer(
    reducer,
    initialTransactionState,
  );

  useEffect(() => {
    /**
     * TODO: cache workflows in case connection lost, gives ability to continue interrupted workflows. To cache, simply add state as the value under a timestamp key.
     * TODO: prompt user if they want to continue a workflow, if no, clear workflow from cache
     * const cachedWorkflows =  window.localStorage.getItem("transactionWorkflows")
     */
  }, [state]);

  return (
    <TransactionStateContext.Provider value={[state, dispatchTransactionState]}>
      {children}
    </TransactionStateContext.Provider>
  );
}
