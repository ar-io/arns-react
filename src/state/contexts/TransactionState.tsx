import { Dispatch, createContext, useContext, useReducer } from 'react';

import { TRANSACTION_WORKFLOW_STATUS } from '../../components/layout/TransactionWorkflow/TransactionWorkflow';
import {
  AntInteraction,
  ArweaveTransactionID,
  CONTRACT_TYPES,
  ContractType,
  REGISTRY_INTERACTION_TYPES,
  RegistryInteraction,
  TransactionData,
  TransactionDataBasePayload,
} from '../../types';
import { ARNS_REGISTRY_ADDRESS } from '../../utils/constants';
import { TransactionAction } from '../reducers/TransactionReducer';

export type TransactionState = {
  deployedTransactionId?: ArweaveTransactionID;
  transactionData: TransactionDataBasePayload | TransactionData; // data that will be used to perform the transaction.
  contractType: ContractType;
  interactionType: AntInteraction | RegistryInteraction;
  workflowStage: TRANSACTION_WORKFLOW_STATUS;
};

export type TransactionStateProviderProps = {
  reducer: React.Reducer<TransactionState, TransactionAction>;
  children: React.ReactNode;
};

export const initialTransactionState: TransactionState = {
  transactionData: {
    assetId: ARNS_REGISTRY_ADDRESS,
    functionName: 'buyRecord',
  },
  contractType: CONTRACT_TYPES.REGISTRY,
  interactionType: REGISTRY_INTERACTION_TYPES.BUY_RECORD,
  workflowStage: TRANSACTION_WORKFLOW_STATUS.PENDING, // confirm deploy complete,
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

  /**
   * TODO: cache workflows in case connection lost, gives ability to continue interrupted workflows. To cache, simply add state as the value under a timestamp key.
   * TODO: prompt user if they want to continue a workflow, if no, clear workflow from cache
   * const cachedWorkflows =  window.localStorage.getItem("transactionWorkflows")
   */

  return (
    <TransactionStateContext.Provider value={[state, dispatchTransactionState]}>
      {children}
    </TransactionStateContext.Provider>
  );
}
