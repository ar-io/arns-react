import PageLoader from '@src/components/layout/progress/PageLoader/PageLoader';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { useArNSState, useGlobalState } from '.';
import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import {
  ANT_INTERACTION_TYPES,
  ExcludedValidInteractionType,
  TransactionData,
} from '../../types';
import { dispatchANTUpdate } from '../actions/dispatchANTUpdate';
import { TransactionAction } from '../reducers/TransactionReducer';
import { useWalletState } from './WalletState';

export type TransactionState = {
  deployedTransactionId?: ArweaveTransactionID;
  transactionData?: TransactionData; // data that will be used to perform the transaction.
  interactionType?: ExcludedValidInteractionType;
  workflowName?: string;
  interactionResult?: any;
  signing: boolean;
  signingMessage?: string;
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
export function TransactionStateProvider({
  reducer,
  children,
}: TransactionStateProviderProps): JSX.Element {
  const [state, dispatchTransactionState] = useReducer(
    reducer,
    initialTransactionState,
  );

  const queryClient = useQueryClient();
  const [{ aoNetwork }] = useGlobalState();
  const [walletState] = useWalletState();
  const [, dispatchArNSState] = useArNSState();

  useEffect(() => {
    if (
      walletState &&
      queryClient &&
      state.interactionResult //&&
      // refreshableInteractionTypes.includes(state?.workflowName ?? '')
    ) {
      queryClient.invalidateQueries(
        {
          queryKey: ['domainInfo'],
          refetchType: 'all',
          exact: false,
        },
        { cancelRefetch: true },
      );
    }

    if (
      walletState.walletAddress &&
      state?.workflowName &&
      Object.values(ANT_INTERACTION_TYPES).includes(
        state.workflowName as ANT_INTERACTION_TYPES,
      ) &&
      state.interactionResult
    ) {
      dispatchANTUpdate({
        queryClient,
        processId: state.interactionResult?.processId,
        walletAddress: walletState.walletAddress,
        dispatch: dispatchArNSState,
        aoNetwork,
      });
    }
  }, [state.interactionResult, queryClient, walletState]);

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
        message={
          state.signingMessage ??
          `Deploying ${state?.workflowName ?? ''} interaction, please wait.`
        }
      />
    </TransactionStateContext.Provider>
  );
}
