import {
  AntInteraction,
  ArweaveTransactionID,
  ContractType,
  RegistryInteraction,
  TransactionData,
} from '../../types';
import {
  TransactionState,
  initialTransactionState,
} from '../contexts/TransactionState';

export type TransactionAction =
  | {
      type: 'setWorkflowStage';
      payload: 'pending' | 'confirmed' | 'successful' | 'failed';
    }
  | { type: 'setTransactionData'; payload: Partial<TransactionData> }
  | { type: 'setDeployedTransactionId'; payload: ArweaveTransactionID }
  | { type: 'setContractType'; payload: ContractType }
  | {
      type: 'setInteractionType';
      payload: AntInteraction | RegistryInteraction;
    }
  | {
      type: 'setError';
      payload: any;
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
    case 'setError': {
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
