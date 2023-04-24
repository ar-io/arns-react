import { ArweaveTransactionID } from '../../types';
import type {
  ArNSContractJSON,
  ArweaveDataProvider,
  ArweaveWalletConnector,
  SmartweaveDataProvider,
} from '../../types';
import { GlobalState } from '../contexts/GlobalState';

export type Action =
  | { type: 'setWalletAddress'; payload: ArweaveTransactionID | undefined }
  | {
      type: 'setWallet';
      payload: ArweaveWalletConnector | undefined;
    }
  | { type: 'setGateway'; payload: string }
  | { type: 'setArnsContractState'; payload: ArNSContractJSON }
  | { type: 'setShowConnectWallet'; payload: boolean }
  | {
      type: 'setArweaveDataProvider';
      payload: ArweaveDataProvider & SmartweaveDataProvider;
    };

export const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case 'setArweaveDataProvider':
      return {
        ...state,
        arweaveDataProvider: action.payload,
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
