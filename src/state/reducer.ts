import { GlobalState } from './state';
import type { ArweaveTransactionId, ArNSContractState } from '../types';

export type Action =
  | { type: 'setWalletAddress'; payload: ArweaveTransactionId }
  | { type: 'setGateway'; payload: string }
  | { type: 'setArnsContractState'; payload: ArNSContractState }
  | { type: 'setErrors'; payload: Array<Error> };

export const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case 'setWalletAddress':
      return {
        ...state,
        connectedWallet: action.payload,
      };
    case 'setGateway':
      return {
        ...state,
        gateway: action.payload,
      };
    case 'setArnsContractState':
      return {
        ...state,
        arnsSourceContract: action.payload,
      };
    case 'setErrors':
      return {
        ...state,
        errors: action.payload,
      };

    default:
      return state;
  }
};
