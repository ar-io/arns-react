import { ArweaveTransactionId } from '../../types';
import { RegistrationState } from '../contexts/RegistrationState';

export type RegistrationAction =
  | { type: 'setDomainName'; payload: string }
  | { type: 'setLeaseDuration'; payload: number }
  | { type: 'setTier'; payload: number }
  | { type: 'setNickname'; payload: string }
  | { type: 'setTicker'; payload: string }
  | { type: 'setControllers'; payload: Array<ArweaveTransactionId> }
  | { type: 'setTTL'; payload: number }
  | { type: 'setAntID'; payload: ArweaveTransactionId }
  | { type: 'setTargetID'; payload: ArweaveTransactionId }
  | { type: 'setFee'; payload: { ar: number; io: number } }
  | { type: 'setIsRegistered'; payload: boolean }
  | { type: 'setStage'; payload: number }
  | { type: 'setIsFirstStage'; payload: boolean }
  | { type: 'setIsLastStage'; payload: boolean }
  | { type: 'setErrors'; payload: Array<Error> }
  | { type: 'reset'; payload: RegistrationState };

export const registrationReducer = (
  state: RegistrationState,
  action: RegistrationAction,
): RegistrationState => {
  switch (action.type) {
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
    case 'setNickname':
      return {
        ...state,
        nickname: action.payload,
      };
    case 'setTicker':
      return {
        ...state,
        ticker: action.payload,
      };
    case 'setControllers':
      return {
        ...state,
        controllers: action.payload,
      };
    case 'setTTL':
      return {
        ...state,
        ttl: action.payload,
      };
    case 'setAntID':
      return {
        ...state,
        antID: action.payload,
      };
    case 'setTargetID':
      return {
        ...state,
        targetID: action.payload,
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
    case 'setErrors':
      return {
        ...state,
        errors: action.payload,
      };
    case 'setIsFirstStage':
      return {
        ...state,
        isFirstStage: action.payload,
      };
    case 'setIsLastStage':
      return {
        ...state,
        isLastStage: action.payload,
      };
    case 'reset':
      return action.payload;

    default:
      return state;
  }
};
