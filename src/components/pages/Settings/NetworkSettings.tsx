import SelectGatewayModal from '@src/components/modals/SelectGatewayModal/SelectGatewayModal';
import { dispatchNewGateway, useGlobalState } from '@src/state';
import { isValidGateway, isValidURL } from '@src/utils';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import {
  ARIO_MINT_ADDRESS,
  SOLANA_NETWORK,
  SOLANA_PROGRAM_IDS,
  SOLANA_RPC_URL,
  SOLANA_RPC_WS_URL,
} from '@src/utils/solana';
import { List, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';

import { SettingInput } from './SettingInput';
import './styles.css';
import { useNetworkSettings } from './useNetworkSettings';

/**
 * Network settings page — Solana-only after the de-AO refactor.
 *
 * The Solana panel is read-only and sourced from `VITE_SOLANA_*` env vars
 * at build time. The mutable settings that survive de-AO are:
 *   - The Arweave gateway (still used for content-target tx-ID resolution
 *     and Turbo data uploads).
 *   - The Turbo payment URL (so ops can point at a staging payment service).
 *
 * Everything else — `aoNetwork.{ARIO,ANT}.{CU_URL, MU_URL, SCHEDULER}`,
 * `arioProcessId`, `antRegistryProcessId`, `hyperbeamUrl`, the `MODE: 'legacy'`
 * AO rebuild block, the `suConnect` SU resolution path, the
 * Testnet/Mainnet defaults toggles — was AO-specific and is gone.
 */
function NetworkSettings() {
  const [{ gateway, arioContract, turboNetwork }, dispatchGlobalState] =
    useGlobalState();

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
        <SolanaNetworkPanel />

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

/**
 * Read-only summary of the active Solana backend configuration.
 *
 * The values are sourced from `VITE_SOLANA_*` env vars at build time
 * (see `src/utils/solana.ts`). Switching networks requires editing
 * `.env.local` and restarting the dev server — they're surfaced here so the
 * user can confirm which RPC + program ids the app is talking to.
 */
function SolanaNetworkPanel() {
  const rows: Array<{ label: string; value: string | undefined }> = [
    { label: 'Solana Network', value: SOLANA_NETWORK },
    { label: 'RPC URL', value: SOLANA_RPC_URL },
    { label: 'RPC WebSocket', value: SOLANA_RPC_WS_URL },
    { label: 'ARIO Mint', value: ARIO_MINT_ADDRESS?.toString() },
    {
      label: 'ario-core Program',
      value: SOLANA_PROGRAM_IDS.coreProgramId?.toString(),
    },
    {
      label: 'ario-gar Program',
      value: SOLANA_PROGRAM_IDS.garProgramId?.toString(),
    },
    {
      label: 'ario-arns Program',
      value: SOLANA_PROGRAM_IDS.arnsProgramId?.toString(),
    },
    {
      label: 'ario-ant Program',
      value: SOLANA_PROGRAM_IDS.antProgramId?.toString(),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-white text-lg font-semibold">
          Solana Network Settings
        </h2>
        <span className="text-grey text-xs">
          Configured via <code className="text-light-grey">VITE_SOLANA_*</code>{' '}
          env vars
        </span>
      </div>

      <div className="flex flex-col gap-2 border border-primary-thin p-3 rounded-md bg-metallic-grey">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-row items-center justify-between gap-3"
          >
            <span className="text-grey text-sm w-48 shrink-0">{label}</span>
            <span className="flex-1 bg-background rounded-md px-3 py-1 border border-primary-thin text-sm text-light-grey font-mono break-all">
              {value ?? (
                <span className="text-color-error">not configured</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NetworkSettings;
