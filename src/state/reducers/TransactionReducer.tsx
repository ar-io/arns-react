import { TRANSACTION_WORKFLOW_STATUS } from '../../components/layout/TransactionWorkflow/TransactionWorkflow';
import {
  ArweaveTransactionID,
  ExcludedValidInteractionType,
  TransactionData,
} from '../../types';
import {
  TransactionState,
  initialTransactionState,
} from '../contexts/TransactionState';

export type TransactionAction =
  | {
      type: 'setWorkflowStage';
      payload: TRANSACTION_WORKFLOW_STATUS;
    }
  | { type: 'setTransactionData'; payload: TransactionData }
  | { type: 'setDeployedTransactionId'; payload?: ArweaveTransactionID }
  | {
      type: 'setInteractionType';
      payload?: ExcludedValidInteractionType;
    }
  | { type: 'reset' };

export const transactionReducer = (
  state: TransactionState,
  action: TransactionAction,
): TransactionState => {
  switch (action.type) {
    case 'setWorkflowStage': {
      return {
        ...state,
        workflowStage: action.payload,
      };
    }
    case 'setTransactionData': {
      return {
        ...state,
        transactionData: action.payload,
      };
    }
    case 'setDeployedTransactionId': {
      return {
        ...state,
        deployedTransactionId: action.payload,
      };
    }
    case 'setInteractionType': {
      return {
        ...state,
        interactionType: action.payload,
      };
    }
    case 'reset': {
      return {
        ...initialTransactionState,
      };
    }
    default:
      return state;
  }
};
