import { AoARIORead, AoARIOWrite } from '@ar.io/sdk/web';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import type { SolanaNetworkConfig } from '@src/utils/solana';

import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import { GlobalState } from '../contexts/GlobalState';

export type GlobalAction =
  | {
      type: 'setGateway';
      payload: {
        gateway: string;
        provider: SimpleArweaveDataProvider;
      };
    }
  | {
      type: 'setTurboNetwork';
      payload: typeof NETWORK_DEFAULTS.TURBO;
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
      type: 'setSolanaConfig';
      payload: {
        config: SolanaNetworkConfig;
        contract: AoARIORead | AoARIOWrite;
      };
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
    case 'setTurboNetwork':
      return {
        ...state,
        turboNetwork: {
          ...state.turboNetwork,
          ...action.payload,
        },
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
    case 'setSolanaConfig':
      return {
        ...state,
        solanaConfig: action.payload.config,
        arioContract: action.payload.contract,
      };
    default:
      return state;
  }
};
