import Arweave from 'arweave';

import type {
  ArNSContractState,
  ArweaveTransactionId,
  ArweaveWalletConnector,
} from '../../types';
import { GlobalState } from '../contexts/GlobalState';

export type Action =
  | { type: 'setWalletAddress'; payload: ArweaveTransactionId | undefined }
  | { type: 'setWallet'; payload: ArweaveWalletConnector | undefined }
  | { type: 'setGateway'; payload: string }
  | { type: 'setArnsContractState'; payload: ArNSContractState }
  | { type: 'setShowConnectWallet'; payload: boolean }
  | { type: 'setIsSearching'; payload: boolean }
  | { type: 'setArweave'; payload: Arweave };

export const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case 'setArweave':
      return {
        ...state,
        arweave: action.payload,
      };
    case 'setWalletAddress':
      return {
        ...state,
        walletAddress: action.payload,
      };
    case 'setWallet':
      return {
        ...state,
        wallet: action.payload,
      };
    case 'setShowConnectWallet':
      return {
        ...state,
        showConnectWallet: action.payload,
      };
    case 'setIsSearching':
      return {
        ...state,
        isSearching: action.payload,
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

    default:
      return state;
  }
};
