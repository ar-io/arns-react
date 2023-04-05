import { AntInteraction, ContractType, RegistryInteraction } from '../../types';
import {
  TransactionState,
  initialTransactionState,
} from '../contexts/TransactionState';

export type TransactionAction =
  | { type: 'setTransactionData'; payload: any }
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
