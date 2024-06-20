import { AoIORead, AoIOWrite } from '@ar.io/sdk/web';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';

import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { GlobalState } from '../contexts/GlobalState';

export type GlobalAction =
  | {
      type: 'setGateway';
      payload: {
        gateway: string;
        provider: ArweaveCompositeDataProvider;
      };
    }
  | {
      type: 'setArNSContractId';
      payload: ArweaveTransactionID;
    }
  | {
      type: 'setBlockHeight';
      payload: number;
    }
  | {
      type: 'setArIOContract';
      payload: AoIORead | AoIOWrite;
    }
  | {
      type: 'setIoTicker';
      payload: string;
    };

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
        lastBlockUpdateTimestamp: Date.now(),
      };
    case 'setIoTicker':
      return {
        ...state,
        ioTicker: action.payload,
      };
    case 'setArIOContract':
      return {
        ...state,
        arioContract: action.payload,
      };
    case 'setArNSContractId':
      return {
        ...state,
        arnsContractId: action.payload,
      };
    default:
      return state;
  }
};
