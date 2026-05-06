import { NETWORK_DEFAULTS } from '@src/utils/constants';
import { useCallback, useMemo, useReducer } from 'react';

import {
  NetworkSettingsAction,
  NetworkSettingsState,
  NetworkSettingsValidation,
} from './types';

/**
 * Reducer + action helpers for the network-settings page. Solana-only after
 * the de-AO refactor — only `gateway` and `turboPaymentUrl` survive as
 * mutable knobs (everything else is configured via `VITE_SOLANA_*` env
 * vars at build time).
 */
export function useNetworkSettings() {
  const [state, dispatch] = useReducer(settingsReducer, {
    ...initialState,
    validation: initialValidation,
  });

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
      syncFromGlobalState,
    }),
    [setValue, setValidation, resetToDefaults, syncFromGlobalState],
  );

  return {
    state: {
      values: {
        gateway: state.gateway,
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
  turboPaymentUrl: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
  showGatewayModal: false,
};

const initialValidation: NetworkSettingsValidation = {
  gateway: true,
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
    case 'SYNC_FROM_GLOBAL_STATE':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
