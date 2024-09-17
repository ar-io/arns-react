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
      type: 'setWorkflowName';
      payload: string;
    }
  | {
      type: 'setInteractionResult';
      payload: ContractInteraction;
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
  | {
      type: 'setSigningMessage';
      payload: string | undefined;
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
    case 'setSigningMessage': {
      return {
        ...state,
        signingMessage: action.payload,
        signing: action.payload ? true : false,
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
