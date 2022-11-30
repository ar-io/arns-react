import type { ArweaveTransactionId } from '../../types';
import { RegistrationAction, RegistrationState } from '../../types';

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
    case 'setChosenTier':
      return {
        ...state,
        chosenTier: action.payload,
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
    case 'setFee':
      return {
        ...state,
        fee: action.payload,
      };
    case 'setIsRegistering':
      return {
        ...state,
        isRegistering: action.payload,
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
    default:
      return state;
  }
};
