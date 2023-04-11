import {
  AntInteraction,
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
      payload: 'pending' | 'confirmed' | 'deployed' | 'successful' | 'failed';
    }
  | { type: 'setTransactionData'; payload: TransactionData }
  | { type: 'setContractType'; payload: ContractType }
  | {
      type: 'setInteractionType';
      payload: AntInteraction | RegistryInteraction;
    }
  | { type: 'reset' };

export const registrationReducer = (
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
