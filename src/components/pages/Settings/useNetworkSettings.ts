import {
  ANT_REGISTRY_ID,
  ARIO_MAINNET_PROCESS_ID,
  ARIO_TESTNET_PROCESS_ID,
} from '@ar.io/sdk/web';
import {
  ANT_REGISTRY_TESTNET_PROCESS_ID,
  ARIO_PROCESS_ID,
  NETWORK_DEFAULTS,
} from '@src/utils/constants';
import { useCallback, useMemo, useReducer } from 'react';

import {
  NetworkSettingsAction,
  NetworkSettingsState,
  NetworkSettingsValidation,
} from './types';

export function useNetworkSettings() {
  const [state, dispatch] = useReducer(settingsReducer, {
    ...initialState,
    validation: initialValidation,
  });

  // Stable action creators
  const setValue = useCallback(
    (field: keyof NetworkSettingsState, value: string | boolean) =>
      dispatch({ type: 'SET_VALUE', field, value }),
    [],
  );
  const setValidation = useCallback(
    (field: keyof NetworkSettingsValidation, isValid: boolean) =>
      dispatch({ type: 'SET_VALIDATION', field, isValid }),
    [],
  );
  const resetToDefaults = useCallback(
    () => dispatch({ type: 'RESET_TO_DEFAULTS' }),
    [],
  );
  const setTestnetDefaults = useCallback(
    () => dispatch({ type: 'SET_TESTNET_DEFAULTS' }),
    [],
  );
  const setMainnetDefaults = useCallback(
    () => dispatch({ type: 'SET_MAINNET_DEFAULTS' }),
    [],
  );
  const syncFromGlobalState = useCallback(
    (payload: Partial<NetworkSettingsState>) =>
      dispatch({ type: 'SYNC_FROM_GLOBAL_STATE', payload }),
    [],
  );

  const actions = useMemo(
    () => ({
      setValue,
      setValidation,
      resetToDefaults,
      setTestnetDefaults,
      setMainnetDefaults,
      syncFromGlobalState,
    }),
    [
      setValue,
      setValidation,
      resetToDefaults,
      setTestnetDefaults,
      setMainnetDefaults,
      syncFromGlobalState,
    ],
  );

  return {
    state: {
      values: {
        gateway: state.gateway,
        cuUrl: state.cuUrl,
        muUrl: state.muUrl,
        suAddress: state.suAddress,
        registryAddress: state.registryAddress,
        antRegistryAddress: state.antRegistryAddress,
        hyperbeamUrl: state.hyperbeamUrl,
        turboPaymentUrl: state.turboPaymentUrl,
        showGatewayModal: state.showGatewayModal,
      },
      validation: state.validation,
    },
    actions,
  };
}

const initialState: NetworkSettingsState = {
  gateway: NETWORK_DEFAULTS.ARWEAVE.HOST,
  cuUrl: NETWORK_DEFAULTS.AO.ARIO.CU_URL,
  muUrl: NETWORK_DEFAULTS.AO.ARIO.MU_URL,
  suAddress: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER,
  registryAddress: ARIO_PROCESS_ID,
  antRegistryAddress: ANT_REGISTRY_ID,
  hyperbeamUrl: NETWORK_DEFAULTS.AO.ARIO.HYPERBEAM_URL,
  turboPaymentUrl: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
  showGatewayModal: false,
};

const initialValidation: NetworkSettingsValidation = {
  gateway: true,
  cuUrl: true,
  muUrl: true,
  suAddress: true,
  registryAddress: true,
  antRegistryAddress: true,
  hyperbeamUrl: true,
  turboPaymentUrl: true,
};

function settingsReducer(
  state: NetworkSettingsState & { validation: NetworkSettingsValidation },
  action: NetworkSettingsAction,
): NetworkSettingsState & { validation: NetworkSettingsValidation } {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        [action.field]: action.value,
      };
    case 'SET_VALIDATION':
      return {
        ...state,
        validation: {
          ...state.validation,
          [action.field]: action.isValid,
        },
      };
    case 'RESET_TO_DEFAULTS':
      return {
        ...initialState,
        validation: initialValidation,
      };
    case 'SET_TESTNET_DEFAULTS':
      return {
        ...state,
        registryAddress: ARIO_TESTNET_PROCESS_ID,
        antRegistryAddress: ANT_REGISTRY_TESTNET_PROCESS_ID,
        gateway: 'ar-io.dev',
        validation: {
          ...state.validation,
          registryAddress: true,
          antRegistryAddress: true,
          gateway: true,
        },
      };
    case 'SET_MAINNET_DEFAULTS':
      return {
        ...state,
        registryAddress: ARIO_MAINNET_PROCESS_ID,
        antRegistryAddress: ANT_REGISTRY_ID,
        gateway: NETWORK_DEFAULTS.ARWEAVE.HOST,
        validation: {
          ...state.validation,
          registryAddress: true,
          antRegistryAddress: true,
          gateway: true,
        },
      };
    case 'SYNC_FROM_GLOBAL_STATE':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
