import { TRANSACTION_WORKFLOW_STATUS } from '../../components/layout/TransactionWorkflow/TransactionWorkflow';
import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import {
  ContractInteraction,
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
  | {
      type: 'setWorkflowName';
      payload: string;
    }
  | {
      type: 'setInteractionResult';
      payload: ContractInteraction;
    }
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
  | {
      type: 'setSigning';
      payload: boolean;
    }
  | { type: 'reset' };

export const transactionReducer = (
  state: TransactionState,
  action: TransactionAction,
): TransactionState => {
  switch (action.type) {
    case 'setSigning': {
      return {
        ...state,
        signing: action.payload,
      };
    }
    case 'setWorkflowStage': {
      return {
        ...state,
        workflowStage: action.payload,
      };
    }
    case 'setWorkflowName': {
      return {
        ...state,
        workflowName: action.payload,
      };
    }
    case 'setInteractionResult': {
      return {
        ...state,
        interactionResult: action.payload,
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
