/**
 * Legacy AO settings-config builder. After the de-AO refactor only `gateway`
 * and `turboPaymentUrl` remain mutable from the UI, and they're wired
 * directly inside `NetworkSettings.tsx`. The big config-driven builder
 * pattern this module used to expose is no longer needed.
 *
 * This file is kept as a stub so any external import (none today) doesn't
 * 404; it can be deleted in a follow-up cleanup.
 */
import { isValidGateway, isValidURL } from '@src/utils';
import { NETWORK_DEFAULTS } from '@src/utils/constants';

import { SettingConfig } from './types';

export function createSettingsConfig(
  updateGateway: (gateway: string) => void,
  updateTurboNetwork: (config: {
    PAYMENT_URL?: string;
    STRIPE_PUBLISHABLE_KEY?: string;
  }) => void,
): SettingConfig[] {
  return [
    {
      key: 'gateway',
      label: 'Current Gateway',
      placeholder: 'Enter custom gateway',
      validator: isValidGateway,
      defaultValue: NETWORK_DEFAULTS.ARWEAVE.HOST,
      type: 'gateway',
      onSet: updateGateway,
      onReset: () => updateGateway(NETWORK_DEFAULTS.ARWEAVE.HOST),
    },
    {
      key: 'turboPaymentUrl',
      label: 'Current Turbo Payment URL',
      placeholder: 'https://payment.ar.io',
      validator: isValidURL,
      defaultValue: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
      type: 'url',
      onSet: (value: string) => updateTurboNetwork({ PAYMENT_URL: value }),
      onReset: () =>
        updateTurboNetwork({
          PAYMENT_URL: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
          STRIPE_PUBLISHABLE_KEY: NETWORK_DEFAULTS.TURBO.STRIPE_PUBLISHABLE_KEY,
        }),
    },
  ];
}
