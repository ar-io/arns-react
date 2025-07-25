import { AoARIORead, AoARIOWrite, AoClient } from '@ar.io/sdk/web';
import { NETWORK_DEFAULTS } from '@src/utils/constants';

import { GlobalState } from '../contexts/GlobalState';

export type GlobalAction =
  | {
      type: 'setGateway';
      payload: {
        gateway: string;
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
    }
  | {
      type: 'setHyperbeamUrl';
      payload: string | undefined;
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
    case 'setHyperbeamUrl':
      return {
        ...state,
        hyperbeamUrl: action.payload,
      };
    default:
      return state;
  }
};
