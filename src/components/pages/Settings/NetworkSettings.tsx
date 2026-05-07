import { address } from '@solana/kit';
import SelectGatewayModal from '@src/components/modals/SelectGatewayModal/SelectGatewayModal';
import { dispatchNewGateway, useGlobalState } from '@src/state';
import { buildDefaultArIO } from '@src/state/contexts/GlobalState';
import { isValidGateway, isValidURL } from '@src/utils';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import {
  SOLANA_NETWORK_PRESETS,
  type SolanaNetwork,
  type SolanaNetworkConfig,
  getInitialSolanaConfig,
  setSolanaConfig,
} from '@src/utils/solana';
import { List, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { SettingInput } from './SettingInput';
import './styles.css';
import { useNetworkSettings } from './useNetworkSettings';

function NetworkSettings() {
  const [
    { gateway, arioContract, turboNetwork, solanaConfig },
    dispatchGlobalState,
  ] = useGlobalState();

  const { state, actions } = useNetworkSettings();

  function reset() {
    actions.resetToDefaults();
    updateGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
    updateTurboNetwork({
      PAYMENT_URL: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
      STRIPE_PUBLISHABLE_KEY: NETWORK_DEFAULTS.TURBO.STRIPE_PUBLISHABLE_KEY,
    });
  }

  useEffect(() => {
    actions.syncFromGlobalState({
      gateway,
      turboPaymentUrl: turboNetwork.PAYMENT_URL,
    });
  }, [gateway, turboNetwork, actions]);

  async function updateGateway(gate: string) {
    try {
      if (!isValidGateway(gate)) {
        throw new Error('Invalid gateway: ' + gate);
      }
      await fetch(`https://${gate}/info`).catch((error) => {
        console.error(error);
        throw new Error('Gateway not available: ' + gate);
      });
      dispatchNewGateway(gate, arioContract, dispatchGlobalState);
    } catch (error) {
      eventEmitter.emit('error', error);
      eventEmitter.emit('error', {
        name: 'Devtools',
        message: 'Invalid gateway: ' + gate,
      });
      actions.setValue('gateway', gateway);
      updateGateway(gateway);
    }
  }

  function updateTurboNetwork(config: {
    PAYMENT_URL?: string;
    STRIPE_PUBLISHABLE_KEY?: string;
  }) {
    try {
      const newConfig = { ...turboNetwork, ...config };
      dispatchGlobalState({
        type: 'setTurboNetwork',
        payload: newConfig,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  return (
    <div className="flex flex-col w-full h-full p-3 text-sm">
      <div className="flex flex-col w-full h-full gap-5 p-2 rounded-xl">
        <SolanaNetworkPanel
          config={solanaConfig}
          onApply={(newConfig) => {
            setSolanaConfig(newConfig);
            const contract = buildDefaultArIO(newConfig);
            dispatchGlobalState({
              type: 'setSolanaConfig',
              payload: { config: newConfig, contract },
            });
            eventEmitter.emit('success', {
              message: `Switched to ${newConfig.network} (${newConfig.rpcUrl})`,
              name: 'Solana Network',
            });
          }}
        />

        <div className="flex flex-row justify-between items-center">
          <h2 className="text-white text-lg font-semibold">
            Arweave Gateway &amp; Turbo
          </h2>
        </div>

        <SettingInput
          label="Current Gateway"
          value={state.values.gateway}
          placeholder="Enter custom gateway"
          isValid={state.validation.gateway}
          onChange={(value) => {
            actions.setValue('gateway', value);
            actions.setValidation('gateway', isValidGateway(value));
          }}
          onSet={() => updateGateway(state.values.gateway)}
          onReset={() => {
            actions.setValue('gateway', NETWORK_DEFAULTS.ARWEAVE.HOST);
            actions.setValidation('gateway', true);
            updateGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
          }}
          onPressEnter={updateGateway}
          additionalContent={
            <button
              className="border border-dark-grey flex flex-row bg-metallic-grey max-w-fit p-1 rounded-md text-white font-semibold hover:scale-105 transition-all text-sm p-2"
              onClick={() => actions.setValue('showGatewayModal', true)}
              style={{ gap: '4px' }}
            >
              <List width={'18px'} height={'18px'} className="fill-white" />
              Choose AR.IO Gateway
            </button>
          }
        />
        <SelectGatewayModal
          show={state.values.showGatewayModal}
          setShow={(show) => actions.setValue('showGatewayModal', show)}
          setGateway={(g: string) => {
            actions.setValue('gateway', g);
            actions.setValidation('gateway', true);
            updateGateway(g);
            actions.setValue('showGatewayModal', false);
          }}
        />

        <SettingInput
          label="Current Turbo Payment URL"
          value={state.values.turboPaymentUrl}
          placeholder="https://payment.ar.io"
          isValid={state.validation.turboPaymentUrl}
          displayValue={
            <span className="text-grey pl-2">{turboNetwork.PAYMENT_URL}</span>
          }
          onChange={(value) => {
            actions.setValue('turboPaymentUrl', value);
            actions.setValidation('turboPaymentUrl', isValidURL(value));
          }}
          onSet={() =>
            updateTurboNetwork({ PAYMENT_URL: state.values.turboPaymentUrl })
          }
          onReset={() => {
            actions.setValue(
              'turboPaymentUrl',
              NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
            );
            actions.setValidation('turboPaymentUrl', true);
            updateTurboNetwork({
              PAYMENT_URL: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
              STRIPE_PUBLISHABLE_KEY:
                NETWORK_DEFAULTS.TURBO.STRIPE_PUBLISHABLE_KEY,
            });
          }}
          onPressEnter={(value) => updateTurboNetwork({ PAYMENT_URL: value })}
        />

        <div className="flex flex-col p-2 w-full h-full justify-end items-end">
          <div className="flex flex-row gap-3 items-end w-full justify-end">
            <button
              className="whitespace-nowrap flex flex-nowrap justify-center items-center gap-2 py-2 px-3 w-fit text-white border border-primary-thin hover:bg-primary hover:text-black bg-metallic-grey rounded-md transition-all"
              onClick={reset}
            >
              Reset to Defaults <RotateCcw width={'16px'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PRESET_NETWORKS: SolanaNetwork[] = ['localnet', 'devnet', 'mainnet-beta'];

const PRESET_LABELS: Record<SolanaNetwork, string> = {
  localnet: 'Localnet (Surfpool)',
  devnet: 'Devnet',
  testnet: 'Testnet',
  'mainnet-beta': 'Mainnet',
};

type SolanaFieldKey =
  | 'rpcUrl'
  | 'rpcWsUrl'
  | 'mintAddress'
  | 'coreProgramId'
  | 'garProgramId'
  | 'arnsProgramId'
  | 'antProgramId';

const FIELD_DEFS: Array<{
  key: SolanaFieldKey;
  label: string;
  placeholder: string;
}> = [
  {
    key: 'rpcUrl',
    label: 'RPC URL',
    placeholder: 'https://api.mainnet-beta.solana.com',
  },
  {
    key: 'rpcWsUrl',
    label: 'RPC WebSocket',
    placeholder: 'wss://api.mainnet-beta.solana.com',
  },
  { key: 'mintAddress', label: 'ARIO Mint', placeholder: 'Address (optional)' },
  {
    key: 'coreProgramId',
    label: 'ario-core Program',
    placeholder: 'Address (optional — uses SDK default)',
  },
  {
    key: 'garProgramId',
    label: 'ario-gar Program',
    placeholder: 'Address (optional — uses SDK default)',
  },
  {
    key: 'arnsProgramId',
    label: 'ario-arns Program',
    placeholder: 'Address (optional — uses SDK default)',
  },
  {
    key: 'antProgramId',
    label: 'ario-ant Program',
    placeholder: 'Address (optional — uses SDK default)',
  },
];

function getFieldValue(
  config: SolanaNetworkConfig,
  key: SolanaFieldKey,
): string {
  switch (key) {
    case 'rpcUrl':
      return config.rpcUrl;
    case 'rpcWsUrl':
      return config.rpcWsUrl;
    case 'mintAddress':
      return config.mintAddress ?? '';
    case 'coreProgramId':
      return config.programIds.coreProgramId?.toString() ?? '';
    case 'garProgramId':
      return config.programIds.garProgramId?.toString() ?? '';
    case 'arnsProgramId':
      return config.programIds.arnsProgramId?.toString() ?? '';
    case 'antProgramId':
      return config.programIds.antProgramId?.toString() ?? '';
  }
}

function setFieldValue(
  config: SolanaNetworkConfig,
  key: SolanaFieldKey,
  value: string,
): SolanaNetworkConfig {
  const trimmed = value.trim();
  const optAddr = trimmed.length > 0 ? address(trimmed) : undefined;

  switch (key) {
    case 'rpcUrl':
      return { ...config, rpcUrl: trimmed };
    case 'rpcWsUrl':
      return { ...config, rpcWsUrl: trimmed };
    case 'mintAddress':
      return { ...config, mintAddress: trimmed || undefined };
    case 'coreProgramId':
      return {
        ...config,
        programIds: { ...config.programIds, coreProgramId: optAddr },
      };
    case 'garProgramId':
      return {
        ...config,
        programIds: { ...config.programIds, garProgramId: optAddr },
      };
    case 'arnsProgramId':
      return {
        ...config,
        programIds: { ...config.programIds, arnsProgramId: optAddr },
      };
    case 'antProgramId':
      return {
        ...config,
        programIds: { ...config.programIds, antProgramId: optAddr },
      };
  }
}

function SolanaNetworkPanel({
  config,
  onApply,
}: {
  config: SolanaNetworkConfig;
  onApply: (config: SolanaNetworkConfig) => void;
}) {
  const [draft, setDraft] = useState<SolanaNetworkConfig>(config);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(config);
    setDirty(false);
  }, [config]);

  const applyPreset = useCallback((network: SolanaNetwork) => {
    const envConfig = getInitialSolanaConfig();
    const preset = SOLANA_NETWORK_PRESETS[network];

    const merged: SolanaNetworkConfig = {
      ...preset,
      programIds:
        envConfig.network === network
          ? { ...preset.programIds, ...envConfig.programIds }
          : preset.programIds,
      mintAddress:
        envConfig.network === network ? envConfig.mintAddress : undefined,
    };

    setDraft(merged);
    setDirty(true);
  }, []);

  const updateField = useCallback((key: SolanaFieldKey, value: string) => {
    setDraft((prev) => setFieldValue(prev, key, value));
    setDirty(true);
  }, []);

  const handleApply = useCallback(() => {
    onApply(draft);
    setDirty(false);
  }, [draft, onApply]);

  const handleReset = useCallback(() => {
    const envConfig = getInitialSolanaConfig();
    setDraft(envConfig);
    onApply(envConfig);
    setDirty(false);
  }, [onApply]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-white text-lg font-semibold">
          Solana Network Settings
        </h2>
      </div>

      <div className="flex flex-row gap-2 flex-wrap">
        {PRESET_NETWORKS.map((network) => (
          <button
            key={network}
            onClick={() => applyPreset(network)}
            className={`py-1.5 px-4 rounded-md text-sm font-medium transition-all border ${
              draft.network === network && !dirty
                ? 'bg-primary text-black border-primary'
                : draft.network === network && dirty
                  ? 'bg-primary/30 text-white border-primary'
                  : 'bg-metallic-grey text-grey border-dark-grey hover:border-white hover:text-white'
            }`}
          >
            {PRESET_LABELS[network]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 border border-primary-thin p-3 rounded-md bg-metallic-grey">
        <div className="flex flex-row items-center justify-between gap-3 mb-1">
          <span className="text-grey text-sm w-48 shrink-0">Network</span>
          <span className="flex-1 bg-background rounded-md px-3 py-1.5 border border-primary-thin text-sm text-light-grey font-mono">
            {draft.network}
          </span>
        </div>

        {FIELD_DEFS.map(({ key, label, placeholder }) => (
          <div
            key={key}
            className="flex flex-row items-center justify-between gap-3"
          >
            <span className="text-grey text-sm w-48 shrink-0">{label}</span>
            <input
              className="flex-1 bg-background rounded-md px-3 py-1.5 border border-primary-thin text-sm text-light-grey font-mono break-all outline-none focus:border-primary transition-colors"
              value={getFieldValue(draft, key)}
              placeholder={placeholder}
              onChange={(e) => updateField(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-row gap-2 justify-end">
        <button
          className="whitespace-nowrap flex flex-nowrap justify-center items-center gap-2 py-1.5 px-3 w-fit text-grey border border-dark-grey hover:border-white hover:text-white bg-metallic-grey rounded-md transition-all text-sm"
          onClick={handleReset}
        >
          Reset to Env Defaults <RotateCcw width={'14px'} />
        </button>
        <button
          disabled={!dirty}
          className={`whitespace-nowrap flex flex-nowrap justify-center items-center gap-2 py-1.5 px-3 w-fit rounded-md transition-all text-sm font-semibold ${
            dirty
              ? 'bg-primary text-black border border-primary hover:brightness-110 cursor-pointer'
              : 'bg-metallic-grey text-grey border border-dark-grey cursor-not-allowed opacity-50'
          }`}
          onClick={handleApply}
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
}

export default NetworkSettings;
