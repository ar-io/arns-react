import {
  ANT_REGISTRY_ID,
  ARIO_MAINNET_PROCESS_ID,
  ARIO_TESTNET_PROCESS_ID,
} from '@ar.io/sdk/web';
import { isArweaveTransactionID, isValidGateway, isValidURL } from '@src/utils';
import {
  ANT_REGISTRY_TESTNET_PROCESS_ID,
  ARIO_PROCESS_ID,
  NETWORK_DEFAULTS,
} from '@src/utils/constants';

import { SettingConfig } from './types';

export function createSettingsConfig(
  updateGateway: (gateway: string) => void,
  updateAoNetwork: (config: {
    CU_URL?: string;
    MU_URL?: string;
    SCHEDULER?: string;
  }) => void,
  updateTurboNetwork: (config: {
    PAYMENT_URL?: string;
    STRIPE_PUBLISHABLE_KEY?: string;
  }) => void,
  dispatchGlobalState: any,
  globalState: any,
): SettingConfig[] {
  return [
    {
      key: 'registryAddress',
      label: 'AR.IO Contract',
      placeholder: 'Enter custom ArNS Registry Address',
      validator: isArweaveTransactionID,
      defaultValue: ARIO_PROCESS_ID,
      testnetValue: ARIO_TESTNET_PROCESS_ID,
      mainnetValue: ARIO_MAINNET_PROCESS_ID,
      type: 'transaction-id',
      onSet: (value: string) => {
        dispatchGlobalState({
          type: 'setIoProcessId',
          payload: value,
        });
      },
      onReset: () => {
        dispatchGlobalState({
          type: 'setIoProcessId',
          payload: ARIO_PROCESS_ID,
        });
      },
    },
    {
      key: 'antRegistryAddress',
      label: 'ANT Registry',
      placeholder: 'Enter custom ANT Registry Address',
      validator: isArweaveTransactionID,
      defaultValue: ANT_REGISTRY_ID,
      testnetValue: ANT_REGISTRY_TESTNET_PROCESS_ID,
      mainnetValue: ANT_REGISTRY_ID,
      type: 'transaction-id',
      onSet: (value: string) => {
        dispatchGlobalState({
          type: 'setAntRegistryProcessId',
          payload: value,
        });
      },
      onReset: () => {
        dispatchGlobalState({
          type: 'setAntRegistryProcessId',
          payload: ANT_REGISTRY_ID,
        });
      },
    },
    {
      key: 'gateway',
      label: 'Current Gateway',
      placeholder: 'Enter custom gateway',
      validator: isValidGateway,
      defaultValue: NETWORK_DEFAULTS.ARWEAVE.HOST,
      testnetValue: 'ar-io.dev',
      mainnetValue: NETWORK_DEFAULTS.ARWEAVE.HOST,
      type: 'gateway',
      onSet: (value: string) => {
        updateGateway(value);
      },
      onReset: () => {
        updateGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
      },
    },
    {
      key: 'cuUrl',
      label: 'Current CU URL',
      placeholder: 'Enter custom CU url',
      validator: isValidURL,
      defaultValue: NETWORK_DEFAULTS.AO.ARIO.CU_URL,
      type: 'url',
      onSet: (value: string) => {
        updateAoNetwork({ CU_URL: value });
      },
      onReset: () => {
        updateAoNetwork({ CU_URL: NETWORK_DEFAULTS.AO.ARIO.CU_URL });
      },
      globalStateSync: {
        getValue: () => globalState.aoNetwork.ARIO.CU_URL,
        setValue: (value: string) => updateAoNetwork({ CU_URL: value }),
      },
    },
    {
      key: 'muUrl',
      label: 'Current MU URL',
      placeholder: 'Enter custom MU url',
      validator: isValidURL,
      defaultValue: NETWORK_DEFAULTS.AO.ARIO.MU_URL,
      type: 'url',
      onSet: (value: string) => {
        updateAoNetwork({ MU_URL: value });
      },
      onReset: () => {
        updateAoNetwork({ MU_URL: NETWORK_DEFAULTS.AO.ARIO.MU_URL });
      },
      globalStateSync: {
        getValue: () => globalState.aoNetwork.ARIO.MU_URL,
        setValue: (value: string) => updateAoNetwork({ MU_URL: value }),
      },
    },
    {
      key: 'suAddress',
      label: 'Current SU Address',
      placeholder: 'Enter custom SU address',
      validator: isArweaveTransactionID,
      defaultValue: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER,
      type: 'transaction-id',
      onSet: (value: string) => {
        updateAoNetwork({ SCHEDULER: value });
      },
      onReset: () => {
        updateAoNetwork({ SCHEDULER: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER });
      },
      globalStateSync: {
        getValue: () => globalState.aoNetwork.ARIO.SCHEDULER,
        setValue: (value: string) => updateAoNetwork({ SCHEDULER: value }),
      },
    },
    {
      key: 'hyperbeamUrl',
      label: 'Current Hyperbeam URL',
      placeholder: 'https://hyperbeam.ario.permaweb.services',
      validator: isValidURL,
      defaultValue: NETWORK_DEFAULTS.AO.ARIO.HYPERBEAM_URL || '',
      type: 'url',
      onSet: (value: string) => {
        dispatchGlobalState({
          type: 'setHyperbeamUrl',
          payload: value.trim(),
        });
      },
      onReset: () => {
        dispatchGlobalState({
          type: 'setHyperbeamUrl',
          payload: NETWORK_DEFAULTS.AO.ARIO.HYPERBEAM_URL || undefined,
        });
      },
    },
    {
      key: 'turboPaymentUrl',
      label: 'Current Turbo Payment URL',
      placeholder: 'https://payment.ar.io',
      validator: isValidURL,
      defaultValue: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
      type: 'url',
      onSet: (value: string) => {
        updateTurboNetwork({ PAYMENT_URL: value });
      },
      onReset: () => {
        updateTurboNetwork({
          PAYMENT_URL: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
          STRIPE_PUBLISHABLE_KEY: NETWORK_DEFAULTS.TURBO.STRIPE_PUBLISHABLE_KEY,
        });
      },
      globalStateSync: {
        getValue: () => globalState.turboNetwork.PAYMENT_URL,
        setValue: (value: string) => updateTurboNetwork({ PAYMENT_URL: value }),
      },
    },
  ];
}
