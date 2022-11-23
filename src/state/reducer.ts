import { JWKInterface } from 'arweave/node/lib/wallet';

import type { ArNSContractState, ArweaveTransactionId } from '../types';
import { GlobalState } from './state';

export type Action =
  | { type: 'setWalletAddress'; payload: ArweaveTransactionId }
  | { type: 'setJwk'; payload: JWKInterface }
  | { type: 'setGateway'; payload: string }
  | { type: 'setArnsContractState'; payload: ArNSContractState }
  | { type: 'setConnectWallet'; payload: boolean };

export const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case 'setWalletAddress':
      return {
        ...state,
        walletAddress: action.payload,
      };
    case 'setJwk':
      return {
        ...state,
        jwk: action.payload,
      };
    case 'setConnectWallet':
      return {
        ...state,
        connectWallet: action.payload,
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
