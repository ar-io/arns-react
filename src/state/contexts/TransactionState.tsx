import PageLoader from '@src/components/layout/progress/PageLoader/PageLoader';
import { rootKey } from '@src/hooks/useARNS';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import {
  ExcludedValidInteractionType,
  INTERACTION_TYPES,
  TransactionData,
} from '../../types';
import { TransactionAction } from '../reducers/TransactionReducer';
import { useWalletState } from './WalletState';

export type TransactionState = {
  deployedTransactionId?: ArweaveTransactionID;
  transactionData?: TransactionData; // data that will be used to perform the transaction.
  interactionType?: ExcludedValidInteractionType;
  workflowName?: string;
  interactionResult?: any;
  signing: boolean;
};

export type TransactionStateProviderProps = {
  reducer: React.Reducer<TransactionState, TransactionAction>;
  children: React.ReactNode;
};

export const initialTransactionState: TransactionState = {
  signing: false,
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

  const queryClient = useQueryClient();
  const [walletAddress] = useWalletState();
  useEffect(() => {
    if (walletAddress && queryClient && state.interactionResult) {
      ['ant', 'arns-records', 'arns-record', 'arns-assets'].map((key) => {
        queryClient.invalidateQueries({
          queryKey: [key],
          refetchType: 'all',
        });
      });
    }
  }, [state.interactionResult, queryClient, walletAddress]);

  /**
   * TODO: cache workflows in case connection lost, gives ability to continue interrupted workflows. To cache, simply add state as the value under a timestamp key.
   * TODO: prompt user if they want to continue a workflow, if no, clear workflow from cache
   * const cachedWorkflows =  window.localStorage.getItem("transactionWorkflows")
   */

  return (
    <TransactionStateContext.Provider value={[state, dispatchTransactionState]}>
      {children}
      <PageLoader
        loading={state.signing}
        message={`Deploying ${
          state?.workflowName ?? ''
        } interaction, please wait.`}
      />
    </TransactionStateContext.Provider>
  );
}
