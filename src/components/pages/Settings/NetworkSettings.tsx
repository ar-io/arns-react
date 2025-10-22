import {
  ANT_REGISTRY_ID,
  AOProcess,
  ARIO,
  ARIO_MAINNET_PROCESS_ID,
  ARIO_TESTNET_PROCESS_ID,
} from '@ar.io/sdk/web';
import { connect as suConnect } from '@permaweb/ao-scheduler-utils';
import { connect } from '@permaweb/aoconnect';
import { Loader } from '@src/components/layout';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import SelectGatewayModal from '@src/components/modals/SelectGatewayModal/SelectGatewayModal';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import {
  dispatchArIOContract,
  dispatchNewGateway,
  useGlobalState,
} from '@src/state';
import { isArweaveTransactionID, isValidGateway, isValidURL } from '@src/utils';
import {
  ANT_REGISTRY_TESTNET_PROCESS_ID,
  ARIO_PROCESS_ID,
  NETWORK_DEFAULTS,
} from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { List, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { SettingInput, TransactionIdSettingInput } from './SettingInput';
import './styles.css';
import { useNetworkSettings } from './useNetworkSettings';

function NetworkSettings() {
  const [
    {
      gateway,
      aoNetwork,
      arioProcessId,
      antRegistryProcessId,
      arioContract,
      turboNetwork,
      hyperbeamUrl,
    },
    dispatchGlobalState,
  ] = useGlobalState();

  const { state, actions } = useNetworkSettings();
  const [suUrl, setSuUrl] = useState<string>();

  function reset() {
    actions.resetToDefaults();
    updateGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
    updateAoNetwork({
      CU_URL: NETWORK_DEFAULTS.AO.ARIO.CU_URL,
      MU_URL: NETWORK_DEFAULTS.AO.ARIO.MU_URL,
      SCHEDULER: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER,
    });
    dispatchGlobalState({
      type: 'setHyperbeamUrl',
      payload: NETWORK_DEFAULTS.AO.ARIO.HYPERBEAM_URL || undefined,
    });
    updateTurboNetwork({
      PAYMENT_URL: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
      STRIPE_PUBLISHABLE_KEY: NETWORK_DEFAULTS.TURBO.STRIPE_PUBLISHABLE_KEY,
    });
  }

  useEffect(() => {
    actions.syncFromGlobalState({
      gateway,
      cuUrl: aoNetwork.ARIO.CU_URL,
      muUrl: aoNetwork.ARIO.MU_URL,
      suAddress: aoNetwork.ARIO.SCHEDULER,
      registryAddress: arioProcessId || '',
      antRegistryAddress: antRegistryProcessId || '',
      hyperbeamUrl: hyperbeamUrl || '',
      turboPaymentUrl: turboNetwork.PAYMENT_URL,
    });
  }, [
    gateway,
    aoNetwork,
    arioProcessId,
    antRegistryProcessId,
    hyperbeamUrl,
    turboNetwork,
    actions,
  ]);

  useEffect(() => {
    async function updateSUUrl(suAddress: string) {
      try {
        const { raw } = suConnect({
          GRAPHQL_URL: 'https://arweave.net/graphql',
        });
        const { url } = await raw(suAddress);
        setSuUrl(url);
      } catch (error) {
        eventEmitter.emit('error', error);
      }
    }
    if (isArweaveTransactionID(state.values.suAddress)) {
      updateSUUrl(state.values.suAddress);
    }
  }, [state.values.suAddress]);

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

  function updateAoNetwork(config: {
    CU_URL?: string;
    MU_URL?: string;
    SCHEDULER?: string;
  }) {
    try {
      const newConfig = {
        ...aoNetwork,
        ...{
          ARIO: { ...aoNetwork.ARIO, ...config, GATEWAY_URL: gateway },
          ANT: { ...aoNetwork.ANT, ...config, GATEWAY_URL: gateway },
        },
      };
      dispatchGlobalState({
        type: 'setAONetwork',
        payload: newConfig,
      });

      const ao = connect({
        GATEWAY_URL: 'https://' + gateway,
        CU_URL: newConfig.ARIO.CU_URL,
        MU_URL: newConfig.ARIO.MU_URL,
        MODE: 'legacy' as const,
      });
      dispatchGlobalState({
        type: 'setARIOAoClient',
        payload: ao,
      });

      const antAo = connect({
        GATEWAY_URL: 'https://' + gateway,
        CU_URL: newConfig.ANT.CU_URL,
        MU_URL: newConfig.ANT.MU_URL,
        MODE: 'legacy' as const,
      });
      dispatchGlobalState({
        type: 'setANTAoClient',
        payload: antAo,
      });

      dispatchArIOContract({
        contract: ARIO.init({
          paymentUrl: turboNetwork.PAYMENT_URL,
          process: new AOProcess({
            processId: arioProcessId,
            ao,
          }),
        }),
        arioProcessId,
        dispatch: dispatchGlobalState,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  function updateTurboNetwork(config: {
    PAYMENT_URL?: string;
    STRIPE_PUBLISHABLE_KEY?: string;
  }) {
    try {
      const newConfig = {
        ...turboNetwork,
        ...config,
      };
      dispatchGlobalState({
        type: 'setTurboNetwork',
        payload: newConfig,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  function setTestnetDefaults() {
    actions.setTestnetDefaults();
    updateGateway('ar-io.dev');
    updateAoNetwork({
      CU_URL: NETWORK_DEFAULTS.AO.ARIO.CU_URL,
      MU_URL: NETWORK_DEFAULTS.AO.ARIO.MU_URL,
      SCHEDULER: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER,
    });
    dispatchGlobalState({
      type: 'setIoProcessId',
      payload: ARIO_TESTNET_PROCESS_ID,
    });
    dispatchGlobalState({
      type: 'setAntRegistryProcessId',
      payload: ANT_REGISTRY_TESTNET_PROCESS_ID,
    });
  }

  function setMainnetDefaults() {
    actions.setMainnetDefaults();
    updateGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
    updateAoNetwork({
      CU_URL: NETWORK_DEFAULTS.AO.ARIO.CU_URL,
      MU_URL: NETWORK_DEFAULTS.AO.ARIO.MU_URL,
      SCHEDULER: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER,
    });
    dispatchGlobalState({
      type: 'setIoProcessId',
      payload: ARIO_MAINNET_PROCESS_ID,
    });
    dispatchGlobalState({
      type: 'setAntRegistryProcessId',
      payload: ANT_REGISTRY_ID,
    });
  }

  return (
    <div className="flex flex-col w-full h-full p-3 text-sm">
      <div className="flex flex-col w-full h-full  gap-5 p-2 rounded-xl">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-white text-lg font-semibold">Network Settings</h2>
          <div
            className="flex-1 flex-row text-sm justify-end"
            style={{ gap: '4px' }}
          >
            <button
              className={
                (state.values.registryAddress === ARIO_TESTNET_PROCESS_ID
                  ? 'bg-primary text-black'
                  : ' bg-dark-grey  text-light-grey') +
                ` flex px-3 py-2 rounded  hover:bg-primary-thin hover:text-primary transition-all`
              }
              onClick={() => setTestnetDefaults()}
            >
              Testnet
            </button>

            <button
              className={
                (state.values.registryAddress === ARIO_MAINNET_PROCESS_ID
                  ? 'bg-primary text-black'
                  : ' bg-dark-grey  text-light-grey') +
                ` flex px-3 py-2 rounded  hover:bg-primary-thin hover:text-primary transition-all`
              }
              onClick={() => setMainnetDefaults()}
            >
              Mainnet
            </button>
          </div>
        </div>
        <TransactionIdSettingInput
          label="AR.IO Contract"
          value={state.values.registryAddress}
          placeholder="Enter custom ArNS Registry Address"
          isValid={state.validation.registryAddress}
          onChange={(value) => {
            actions.setValue('registryAddress', value);
            actions.setValidation(
              'registryAddress',
              isArweaveTransactionID(value),
            );
            dispatchGlobalState({
              type: 'setIoProcessId',
              payload: value,
            });
          }}
          onSet={() => {
            dispatchGlobalState({
              type: 'setIoProcessId',
              payload: state.values.registryAddress,
            });
          }}
          onReset={() => {
            actions.setValue('registryAddress', ARIO_PROCESS_ID);
            actions.setValidation('registryAddress', true);
            dispatchGlobalState({
              type: 'setIoProcessId',
              payload: ARIO_PROCESS_ID,
            });
          }}
          onPressEnter={(value) => {
            if (isArweaveTransactionID(value)) {
              dispatchGlobalState({
                type: 'setIoProcessId',
                payload: value,
              });
            }
          }}
        />
        <TransactionIdSettingInput
          label="ANT Registry"
          value={state.values.antRegistryAddress}
          placeholder="Enter custom ANT Registry Address"
          isValid={state.validation.antRegistryAddress}
          onChange={(value) => {
            actions.setValue('antRegistryAddress', value);
            actions.setValidation(
              'antRegistryAddress',
              isArweaveTransactionID(value),
            );
            dispatchGlobalState({
              type: 'setAntRegistryProcessId',
              payload: value,
            });
          }}
          onSet={() => {
            dispatchGlobalState({
              type: 'setAntRegistryProcessId',
              payload: state.values.antRegistryAddress,
            });
          }}
          onReset={() => {
            actions.setValue('antRegistryAddress', ANT_REGISTRY_ID);
            actions.setValidation('antRegistryAddress', true);
            dispatchGlobalState({
              type: 'setAntRegistryProcessId',
              payload: ANT_REGISTRY_ID,
            });
          }}
          onPressEnter={(value) => {
            if (isArweaveTransactionID(value)) {
              dispatchGlobalState({
                type: 'setAntRegistryProcessId',
                payload: value,
              });
            }
          }}
        />

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
          label="Current CU URL"
          value={state.values.cuUrl}
          placeholder="Enter custom CU url"
          isValid={state.validation.cuUrl}
          displayValue={
            <span className="text-grey pl-2">{aoNetwork.ARIO.CU_URL}</span>
          }
          onChange={(value) => {
            actions.setValue('cuUrl', value);
            actions.setValidation('cuUrl', isValidURL(value));
          }}
          onSet={() => updateAoNetwork({ CU_URL: state.values.cuUrl })}
          onReset={() => {
            actions.setValue('cuUrl', NETWORK_DEFAULTS.AO.ARIO.CU_URL);
            actions.setValidation('cuUrl', true);
            updateAoNetwork({ CU_URL: NETWORK_DEFAULTS.AO.ARIO.CU_URL });
          }}
          onPressEnter={(value) => updateAoNetwork({ CU_URL: value })}
        />

        <SettingInput
          label="Current MU URL"
          value={state.values.muUrl}
          placeholder="Enter custom MU url"
          isValid={state.validation.muUrl}
          displayValue={
            <span className="text-grey pl-2">{aoNetwork.ARIO.MU_URL}</span>
          }
          onChange={(value) => {
            actions.setValue('muUrl', value);
            actions.setValidation('muUrl', isValidURL(value));
          }}
          onSet={() => updateAoNetwork({ MU_URL: state.values.muUrl })}
          onReset={() => {
            actions.setValue('muUrl', NETWORK_DEFAULTS.AO.ARIO.MU_URL);
            actions.setValidation('muUrl', true);
            updateAoNetwork({ MU_URL: NETWORK_DEFAULTS.AO.ARIO.MU_URL });
          }}
          onPressEnter={(value) => updateAoNetwork({ MU_URL: value })}
        />

        <SettingInput
          label="Current SU Address"
          value={state.values.suAddress}
          placeholder="Enter custom SU address"
          isValid={state.validation.suAddress}
          displayValue={
            <span className="text-grey pl-2">
              <ArweaveID
                id={new ArweaveTransactionID(aoNetwork.ARIO.SCHEDULER)}
                shouldLink
                type={ArweaveIdTypes.ADDRESS}
                characterCount={16}
              />
            </span>
          }
          onChange={(value) => {
            actions.setValue('suAddress', value);
            actions.setValidation('suAddress', isArweaveTransactionID(value));
          }}
          onSet={() => updateAoNetwork({ SCHEDULER: state.values.suAddress })}
          onReset={() => {
            actions.setValue('suAddress', NETWORK_DEFAULTS.AO.ARIO.SCHEDULER);
            actions.setValidation('suAddress', true);
            updateAoNetwork({ SCHEDULER: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER });
          }}
          onPressEnter={(value) => updateAoNetwork({ SCHEDULER: value })}
          additionalContent={
            suUrl ? (
              <span className="flex flex-row flex-1 w-full bg-background rounded-md px-4 py-1 border border-primary-thin text-md text-light-grey">
                SU URL:&nbsp;
                <Link
                  to={suUrl}
                  className="link"
                  target="_blank"
                  rel="noreferrer"
                >
                  {suUrl}
                </Link>
              </span>
            ) : (
              <Loader size={20} />
            )
          }
        />
        <SettingInput
          label="Current Hyperbeam URL"
          value={state.values.hyperbeamUrl || ''}
          placeholder="https://hyperbeam.ario.permaweb.services"
          isValid={state.validation.hyperbeamUrl}
          displayValue={
            <span className="text-grey pl-2">
              {hyperbeamUrl || ''}
              {!hyperbeamUrl && (
                <span className="text-red-500 font-bold pl-2">DISABLED</span>
              )}
            </span>
          }
          onChange={(value) => {
            actions.setValue('hyperbeamUrl', value);
            actions.setValidation('hyperbeamUrl', isValidURL(value));
          }}
          onSet={() =>
            dispatchGlobalState({
              type: 'setHyperbeamUrl',
              payload: state.values.hyperbeamUrl?.trim() || undefined,
            })
          }
          onReset={() => {
            actions.setValue(
              'hyperbeamUrl',
              NETWORK_DEFAULTS.AO.ARIO.HYPERBEAM_URL || '',
            );
            actions.setValidation('hyperbeamUrl', true);
            dispatchGlobalState({
              type: 'setHyperbeamUrl',
              payload: NETWORK_DEFAULTS.AO.ARIO.HYPERBEAM_URL || undefined,
            });
          }}
          onPressEnter={(value) =>
            dispatchGlobalState({
              type: 'setHyperbeamUrl',
              payload: value,
            })
          }
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
            updateTurboNetwork({
              PAYMENT_URL: state.values.turboPaymentUrl,
            })
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
          onPressEnter={(value) =>
            updateTurboNetwork({
              PAYMENT_URL: value,
            })
          }
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

export default NetworkSettings;
