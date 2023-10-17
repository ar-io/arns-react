import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { ArweaveTransactionID } from '../../types';
import { ArweaveWalletConnector, PDNSContractJSON } from '../../types';
import { GlobalState } from '../contexts/GlobalState';

export type GlobalAction =
  | { type: 'setWalletAddress'; payload: ArweaveTransactionID | undefined }
  | {
      type: 'setWallet';
      payload: ArweaveWalletConnector | undefined;
    }
  | {
      type: 'setGateway';
      payload: {
        gateway: string;
        provider: ArweaveCompositeDataProvider;
      };
    }
  | { type: 'setBlockHeight'; payload: number }
  | { type: 'setPDNSContractState'; payload: PDNSContractJSON }
  | { type: 'setBalances'; payload: { io: number; ar: number } }
  | { type: 'setArweaveDataProvider'; payload: ArweaveCompositeDataProvider };

export const reducer = (
  state: GlobalState,
  action: GlobalAction,
): GlobalState => {
  switch (action.type) {
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
        gateway: action.payload.gateway,
        arweaveDataProvider: action.payload.provider,
      };
    case 'setBlockHeight':
      return {
        ...state,
        blockHeight: action.payload,
      };
    case 'setPDNSContractState':
      return {
        ...state,
        pdnsSourceContract: action.payload,
      };
    case 'setBalances':
      return {
        ...state,
        balances: action.payload,
      };
    case 'setArweaveDataProvider':
      return {
        ...state,
        arweaveDataProvider: action.payload,
      };
    default:
      return state;
  }
};
