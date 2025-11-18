export interface NetworkSettingsState {
  gateway: string;
  cuUrl: string;
  muUrl: string;
  suAddress: string;
  registryAddress: string;
  antRegistryAddress: string;
  hyperbeamUrl?: string;
  turboPaymentUrl: string;
  showGatewayModal: boolean;
}

export interface NetworkSettingsValidation {
  gateway: boolean;
  cuUrl: boolean;
  muUrl: boolean;
  suAddress: boolean;
  registryAddress: boolean;
  antRegistryAddress: boolean;
  hyperbeamUrl: boolean;
  turboPaymentUrl: boolean;
}

export type NetworkSettingsAction =
  | {
      type: 'SET_VALUE';
      field: keyof NetworkSettingsState;
      value: string | boolean;
    }
  | {
      type: 'SET_VALIDATION';
      field: keyof NetworkSettingsValidation;
      isValid: boolean;
    }
  | { type: 'RESET_TO_DEFAULTS' }
  | { type: 'SET_TESTNET_DEFAULTS' }
  | { type: 'SET_MAINNET_DEFAULTS' }
  | { type: 'SYNC_FROM_GLOBAL_STATE'; payload: Partial<NetworkSettingsState> };

export interface SettingConfig {
  key: keyof NetworkSettingsState;
  label: string;
  placeholder: string;
  validator: (value: string) => boolean;
  defaultValue: string;
  testnetValue?: string;
  mainnetValue?: string;
  type: 'url' | 'transaction-id' | 'gateway';
  onSet?: (value: string) => void;
  onReset?: () => void;
  globalStateSync?: {
    getValue: () => string;
    setValue: (value: string) => void;
  };
}
