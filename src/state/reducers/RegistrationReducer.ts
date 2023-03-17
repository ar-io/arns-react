import { ANTContract } from '../../services/arweave/AntContract';
import { ArweaveTransactionID } from '../../types';
import {
  RegistrationState,
  initialRegistrationState,
} from '../contexts/RegistrationState';

export type RegistrationAction =
  | { type: 'setDomainName'; payload?: string }
  | { type: 'setLeaseDuration'; payload: number }
  | { type: 'setTier'; payload: number }
  | { type: 'setAntID'; payload: ArweaveTransactionID | undefined }
  | { type: 'setAntContract'; payload: ANTContract }
  | { type: 'setResolvedTx'; payload: ArweaveTransactionID | undefined }
  | { type: 'setFee'; payload: { ar: number; io: number } }
  | { type: 'setIsRegistered'; payload: boolean }
  | { type: 'setStage'; payload: number }
  | { type: 'setIsSearching'; payload: boolean }
  | { type: 'setIsFirstStage'; payload: boolean }
  | { type: 'setIsLastStage'; payload: boolean }
  | { type: 'setErrors'; payload: Array<Error> }
  | { type: 'reset'; payload?: boolean };

export const registrationReducer = (
  state: RegistrationState,
  action: RegistrationAction,
): RegistrationState => {
  switch (action.type) {
    case 'setIsSearching': {
      return {
        ...state,
        isSearching: action.payload,
      };
    }
    case 'setDomainName':
      return {
        ...state,
        domain: action.payload,
      };
    case 'setLeaseDuration':
      return {
        ...state,
        leaseDuration: action.payload,
      };
    case 'setTier':
      return {
        ...state,
        tier: action.payload,
      };
    case 'setAntID':
      return {
        ...state,
        antID: action.payload,
      };
    case 'setAntContract':
      return {
        ...state,
        antContract: action.payload,
      };
    case 'setResolvedTx':
      return {
        ...state,
        resolvedTxID: action.payload,
      };
    case 'setFee':
      return {
        ...state,
        fee: action.payload,
      };
    case 'setIsRegistered':
      return {
        ...state,
        isRegistered: action.payload,
      };
    case 'setStage':
      return {
        ...state,
        stage: action.payload,
      };
    case 'reset':
      return {
        ...initialRegistrationState,
      };
    default:
      return state;
  }
};
