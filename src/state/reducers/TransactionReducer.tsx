import { TRANSACTION_WORKFLOW_STATUS } from '../../components/layout/TransactionWorkflow/TransactionWorkflow';
import {
  ArweaveTransactionID,
  CONTRACT_TYPES,
  InteractionTypeName,
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
  | { type: 'setDeployedTransactionId'; payload: ArweaveTransactionID }
  | { type: 'setContractType'; payload: CONTRACT_TYPES }
  | {
      type: 'setInteractionType';
      payload: InteractionTypeName;
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
    case 'setContractType': {
      return {
        ...state,
        contractType: action.payload,
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
