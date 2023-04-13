import { Dispatch, createContext, useContext, useReducer } from 'react';

import {
  AntInteraction,
  ArweaveTransactionID,
  CONTRACT_TYPES,
  ContractType,
  REGISTRY_INTERACTION_TYPES,
  RegistryInteraction,
  TransactionData,
} from '../../types';
import {
  ARNS_REGISTRY_ADDRESS,
  STUB_ARWEAVE_TXID,
} from '../../utils/constants';
import { TransactionAction } from '../reducers/TransactionReducer';

export type TransactionState = {
  deployedTransactionId?: ArweaveTransactionID;
  transactionData: Partial<TransactionData>; // data that will be used to perform the transaction.
  contractType: ContractType;
  interactionType: AntInteraction | RegistryInteraction;
  workflowStage: 'pending' | 'confirmed' | 'successful' | 'failed';
  error?: any;
};

export type TransactionStateProviderProps = {
  reducer: React.Reducer<TransactionState, TransactionAction>;
  children: React.ReactNode;
};

export const initialTransactionState: TransactionState = {
  transactionData: {
    assetId: ARNS_REGISTRY_ADDRESS,
    functionName: 'buyRecord',
    name: 'arweave',
    contractTxId: STUB_ARWEAVE_TXID,
    years: 1,
    tierNumber: 1,
  },
  contractType: CONTRACT_TYPES.REGISTRY,
  interactionType: REGISTRY_INTERACTION_TYPES.BUY_RECORD,
  workflowStage: 'pending', // confirm deploy complete,
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
