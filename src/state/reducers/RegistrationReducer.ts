import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { TRANSACTION_TYPES } from '../../types';
import {
  RegistrationState,
  initialRegistrationState,
} from '../contexts/RegistrationState';

export type RegistrationAction =
  | { type: 'setDomainName'; payload: string }
  | { type: 'setTargetId'; payload: ArweaveTransactionID }
  | { type: 'setRegistrationType'; payload: TRANSACTION_TYPES }
  | { type: 'setLeaseDuration'; payload: number }
  | { type: 'setANTID'; payload: ArweaveTransactionID | undefined }
  | { type: 'setResolvedTx'; payload: ArweaveTransactionID | undefined }
  | { type: 'setFee'; payload: { ar: number; [x: string]: number | undefined } }
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
    case 'setTargetId':
      return {
        ...state,
        targetId: action.payload,
      };
    case 'setLeaseDuration':
      return {
        ...state,
        leaseDuration: action.payload,
      };

    case 'setANTID':
      return {
        ...state,
        antID: action.payload,
      };
    case 'setRegistrationType':
      return {
        ...state,
        registrationType: action.payload,
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
