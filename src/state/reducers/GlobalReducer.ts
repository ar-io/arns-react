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
  | { type: 'setArweave'; payload: Arweave }
  | { type: 'pushNotification'; payload: string }
  | { type: 'removeNotification'; payload: string };

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
    case 'setIsSearching':
      return {
        ...state,
        isSearching: action.payload,
      };
    case 'pushNotification': {
      return {
        ...state,
        notifications: [action.payload].concat(state.notifications).slice(0, 5),
      };
    }
    case 'removeNotification': {
      return {
        ...state,
        notifications: state.notifications.filter((e) => e !== action.payload),
      };
    }
    default:
      return state;
  }
};
