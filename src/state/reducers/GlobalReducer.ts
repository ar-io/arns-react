import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { PDNSContractJSON } from '../../types';
import { GlobalState } from '../contexts/GlobalState';

export type GlobalAction =
  | {
      type: 'setGateway';
      payload: {
        gateway: string;
        provider: ArweaveCompositeDataProvider;
      };
    }
  | { type: 'setBlockHeight'; payload: number }
  | { type: 'setPDNSContractState'; payload: PDNSContractJSON };

export const reducer = (
  state: GlobalState,
  action: GlobalAction,
): GlobalState => {
  switch (action.type) {
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
    default:
      return state;
  }
};
