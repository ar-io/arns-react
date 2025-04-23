import { AoARIORead, AoARIOWrite, AoClient } from '@ar.io/sdk/web';
import { NETWORK_DEFAULTS } from '@src/utils/constants';

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
      type: 'setAONetwork';
      payload: typeof NETWORK_DEFAULTS.AO;
    }
  | {
      type: 'setTurboNetwork';
      payload: typeof NETWORK_DEFAULTS.TURBO;
    }
  | {
      type: 'setARIOAoClient';
      payload: AoClient;
    }
  | {
      type: 'setANTAoClient';
      payload: AoClient;
    }
  | {
      type: 'setIoProcessId';
      payload: string;
    }
  | {
      type: 'setBlockHeight';
      payload: number;
    }
  | {
      type: 'setArIOContract';
      payload: AoARIORead | AoARIOWrite;
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
    case 'setAONetwork':
      return {
        ...state,
        aoNetwork: {
          ...state.aoNetwork,
          ...action.payload,
        },
      };
    case 'setTurboNetwork':
      return {
        ...state,
        turboNetwork: {
          ...state.turboNetwork,
          ...action.payload,
        },
      };
    case 'setARIOAoClient':
      return {
        ...state,
        aoClient: action.payload,
      };
    case 'setANTAoClient':
      return {
        ...state,
        antAoClient: action.payload,
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
        arioTicker: action.payload,
      };
    case 'setArIOContract':
      return {
        ...state,
        arioContract: action.payload,
      };
    case 'setIoProcessId':
      return {
        ...state,
        arioProcessId: action.payload,
      };
    default:
      return state;
  }
};
