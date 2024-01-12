import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { ArweaveWalletConnector } from '../../types';
import { WalletState } from '../contexts/WalletState';

export type WalletAction =
  | { type: 'setWalletAddress'; payload: ArweaveTransactionID | undefined }
  | {
      type: 'setWallet';
      payload: ArweaveWalletConnector | undefined;
    }
  | { type: 'setBalances'; payload: { [x: string]: number; ar: number } }
  | { type: 'setWalletStateInitialized' };

export const walletReducer = (
  state: WalletState,
  action: WalletAction,
): WalletState => {
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
    case 'setBalances':
      return {
        ...state,
        balances: action.payload,
      };
    case 'setWalletStateInitialized':
      return {
        ...state,
        walletStateInitialized: true,
      };
    default:
      return state;
  }
};
