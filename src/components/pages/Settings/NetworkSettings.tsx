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
import { Input } from 'antd';
import { List, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

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
  const [newGateway, setNewGateway] = useState<string>(gateway);
  const [validGateway, setValidGateway] = useState<boolean>(true);
  const [newCuUrl, setNewCuUrl] = useState<string>(aoNetwork.ARIO.CU_URL);
  const [validCuUrl, setValidCuUrl] = useState<boolean>(true);
  const [newMuUrl, setNewMuUrl] = useState<string>(aoNetwork.ARIO.MU_URL);
  const [validMuUrl, setValidMuUrl] = useState<boolean>(true);
  const [newSuAddress, setNewSuAddress] = useState<string>(
    aoNetwork.ARIO.SCHEDULER,
  );
  const [suUrl, setSuUrl] = useState<string>();
  const [validSuAddress, setValidSuAddress] = useState<boolean>(true);
  const [showGatewayModal, setShowGatewayModal] = useState<boolean>(false);
  const [registryAddress, setRegistryAddress] = useState<string>(
    arioProcessId || '',
  );
  const [antRegistryAddress, setAntRegistryAddress] = useState<string>(
    antRegistryProcessId || '',
  );
  const [isValidAntRegistryAddress, setIsValidAntRegistryAddress] =
    useState<boolean>(true);
  const [isValidAddress, setIsValidAddress] = useState<boolean>(true);
  const [newHyperbeamUrl, setNewHyperbeamUrl] = useState<string>(
    hyperbeamUrl || '',
  );
  const [validHyperbeamUrl, setValidHyperbeamUrl] = useState<boolean>(true);
  const [newTurboPaymentUrl, setNewTurboPaymentUrl] = useState<string>(
    turboNetwork.PAYMENT_URL,
  );
  const [validTurboPaymentUrl, setValidTurboPaymentUrl] =
    useState<boolean>(true);

  function reset() {
    // arns
    setRegistryAddress(ARIO_PROCESS_ID);
    setIsValidAddress(true);
    // ant registry
    setAntRegistryAddress(ANT_REGISTRY_ID);
    setIsValidAntRegistryAddress(true);
    // gateway
    setNewGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
    setValidGateway(true);
    updateGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
    // ao network
    setNewCuUrl(NETWORK_DEFAULTS.AO.ARIO.CU_URL);
    setValidCuUrl(true);
    setNewMuUrl(NETWORK_DEFAULTS.AO.ARIO.MU_URL);
    setValidMuUrl(true);
    setNewSuAddress(NETWORK_DEFAULTS.AO.ARIO.SCHEDULER);
    setValidSuAddress(true);
    updateAoNetwork({
      CU_URL: NETWORK_DEFAULTS.AO.ARIO.CU_URL,
      MU_URL: NETWORK_DEFAULTS.AO.ARIO.MU_URL,
      SCHEDULER: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER,
    });
    // hyperbeam network
    setNewHyperbeamUrl(NETWORK_DEFAULTS.AO.ARIO.HYPERBEAM_URL || '');
    setValidHyperbeamUrl(true);
    dispatchGlobalState({
      type: 'setHyperbeamUrl',
      payload: NETWORK_DEFAULTS.AO.ARIO.HYPERBEAM_URL || undefined,
    });
    // turbo network
    setNewTurboPaymentUrl(NETWORK_DEFAULTS.TURBO.PAYMENT_URL);
    setValidTurboPaymentUrl(true);
    updateTurboNetwork({
      PAYMENT_URL: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
      STRIPE_PUBLISHABLE_KEY: NETWORK_DEFAULTS.TURBO.STRIPE_PUBLISHABLE_KEY,
    });
  }

  useEffect(() => {
    setNewGateway(gateway);
    setValidGateway(true);
  }, [gateway]);

  useEffect(() => {
    setNewCuUrl(aoNetwork.ARIO.CU_URL);
    setValidCuUrl(true);
    setNewMuUrl(aoNetwork.ARIO.MU_URL);
    setValidMuUrl(true);
    setNewSuAddress(aoNetwork.ARIO.SCHEDULER);
    setValidSuAddress(true);
  }, [aoNetwork]);

  useEffect(() => {
    setNewHyperbeamUrl(hyperbeamUrl || '');
    setValidHyperbeamUrl(true);
  }, [hyperbeamUrl]);

  useEffect(() => {
    setNewTurboPaymentUrl(turboNetwork.PAYMENT_URL);
    setValidTurboPaymentUrl(true);
  }, [turboNetwork]);

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
    if (isArweaveTransactionID(aoNetwork.ARIO.SCHEDULER)) {
      updateSUUrl(aoNetwork.ARIO.SCHEDULER);
    }
  }, [aoNetwork]);

  async function updateGateway(gate: string) {
    try {
      if (!isValidGateway(gate)) {
        throw new Error('Invalid gateway: ' + gate);
      }
      // test gateway
      await fetch(`https://${gate}/info`).catch((error) => {
        console.error(error);
        throw new Error('Gateway not available: ' + gate);
      });
      // Always try to update gateway
      dispatchNewGateway(gate, arioContract, dispatchGlobalState);
    } catch (error) {
      eventEmitter.emit('error', error);
      eventEmitter.emit('error', {
        name: 'Devtools',
        message: 'Invalid gateway: ' + gate,
      });
      setNewGateway(gateway);
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

  // when setting testnet , set the ANT REGISTRY, ARIO CONTRACT AND TURBO PAYMENT TO USE THE TESNTET VALUES
  function setTestnetDefaults() {
    setRegistryAddress(ARIO_TESTNET_PROCESS_ID);
    setAntRegistryAddress(ANT_REGISTRY_TESTNET_PROCESS_ID);
    setNewGateway('ar-io.dev');
    setValidGateway(true);

    // update the global state
    updateGateway('ar-io.dev');
    updateAoNetwork({
      CU_URL: NETWORK_DEFAULTS.AO.ARIO.CU_URL,
      MU_URL: NETWORK_DEFAULTS.AO.ARIO.MU_URL,
      SCHEDULER: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER,
    });

    // update the global state
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
    setRegistryAddress(ARIO_MAINNET_PROCESS_ID);
    setAntRegistryAddress(ANT_REGISTRY_ID);
    setNewGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
    setValidGateway(true);

    // update gateway
    updateGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
    updateAoNetwork({
      CU_URL: NETWORK_DEFAULTS.AO.ARIO.CU_URL,
      MU_URL: NETWORK_DEFAULTS.AO.ARIO.MU_URL,
      SCHEDULER: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER,
    });

    // update the global state
    dispatchGlobalState({
      type: 'setIoProcessId',
      payload: ARIO_MAINNET_PROCESS_ID,
    });
    dispatchGlobalState({
      type: 'setAntRegistryProcessId',
      payload: ANT_REGISTRY_ID,
    });
  }

  const labelClass =
    'flex flex-row flex-1 w-full bg-background rounded-md px-4 py-1 border border-primary-thin text-md text-light-grey ';
  const inputClass = 'bg-foreground justify-center items-center outline-none';
  const inputContainerClass =
    'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';
  const setButtonClass =
    'text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-full flex w-fit py-1 px-3 rounded-sm text-xs font-semibold';
  const resetIconClass = 'py-1 px-3 text-grey hover:text-white transition-all';
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
                (registryAddress === ARIO_TESTNET_PROCESS_ID
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
                (registryAddress === ARIO_MAINNET_PROCESS_ID
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
        <div className={inputContainerClass}>
          <div
            className="flex flex-row justify-between items-center"
            style={{ gap: '4px' }}
          >
            <div className={labelClass}>
              <span className="flex-none">AR.IO Contract: </span>
              {registryAddress ? (
                <ArweaveID
                  id={new ArweaveTransactionID(registryAddress)}
                  shouldLink
                  type={ArweaveIdTypes.CONTRACT}
                />
              ) : (
                'N/A'
              )}
            </div>
          </div>

          <Input
            className={inputClass}
            prefixCls="settings-input"
            placeholder="Enter custom ArNS Registry Address"
            value={registryAddress}
            onChange={(e) => {
              setIsValidAddress(isArweaveTransactionID(e.target.value.trim()));
              setRegistryAddress(e.target.value.trim());
              dispatchGlobalState({
                type: 'setIoProcessId',
                payload: e.target.value.trim(),
              });
            }}
            onClear={() => setRegistryAddress('')}
            onPressEnter={() =>
              isArweaveTransactionID(registryAddress) &&
              setRegistryAddress(registryAddress) &&
              dispatchGlobalState({
                type: 'setIoProcessId',
                payload: registryAddress,
              })
            }
            variant="outlined"
            status={isValidAddress ? '' : 'error'}
            addonAfter={
              <div className="flex flex-row" style={{ gap: '4px' }}>
                <button
                  disabled={!isValidAddress}
                  className={setButtonClass}
                  onClick={() => {
                    setRegistryAddress(registryAddress);
                    dispatchGlobalState({
                      type: 'setIoProcessId',
                      payload: registryAddress,
                    });
                  }}
                >
                  Set
                </button>
                <button
                  className={resetIconClass}
                  onClick={() => {
                    setRegistryAddress(ARIO_PROCESS_ID);
                    setIsValidAddress(true);
                    dispatchGlobalState({
                      type: 'setIoProcessId',
                      payload: ARIO_PROCESS_ID,
                    });
                  }}
                >
                  <RotateCcw width={'16px'} />
                </button>
              </div>
            }
          />
          {isValidAddress === false ? (
            <span className="text-color-error" style={{ marginBottom: '10px' }}>
              invalid address
            </span>
          ) : (
            <></>
          )}
        </div>
        <div className={inputContainerClass}>
          <div
            className="flex flex-row justify-between items-center"
            style={{ gap: '4px' }}
          >
            <div className={labelClass}>
              <span className="flex-none">ANT Registry: </span>
              {antRegistryAddress ? (
                <ArweaveID
                  id={new ArweaveTransactionID(antRegistryAddress)}
                  shouldLink
                  type={ArweaveIdTypes.CONTRACT}
                />
              ) : (
                'N/A'
              )}
            </div>
          </div>
          <Input
            className={inputClass}
            prefixCls="settings-input"
            placeholder="Enter custom ANT Registry Address"
            value={antRegistryAddress}
            onChange={(e) => {
              setIsValidAntRegistryAddress(
                isArweaveTransactionID(e.target.value.trim()),
              );
              setAntRegistryAddress(e.target.value.trim());
              dispatchGlobalState({
                type: 'setAntRegistryProcessId',
                payload: e.target.value.trim(),
              });
            }}
            onClear={() => setAntRegistryAddress('')}
            onPressEnter={() =>
              isArweaveTransactionID(antRegistryAddress) &&
              setAntRegistryAddress(antRegistryAddress) &&
              dispatchGlobalState({
                type: 'setAntRegistryProcessId',
                payload: antRegistryAddress,
              })
            }
            variant="outlined"
            status={isValidAntRegistryAddress ? '' : 'error'}
            addonAfter={
              <div className="flex flex-row" style={{ gap: '4px' }}>
                <button
                  disabled={!isValidAntRegistryAddress}
                  className={setButtonClass}
                  onClick={() => {
                    setAntRegistryAddress(antRegistryAddress);
                    dispatchGlobalState({
                      type: 'setAntRegistryProcessId',
                      payload: antRegistryAddress,
                    });
                  }}
                >
                  Set
                </button>
                <button
                  className={resetIconClass}
                  onClick={() => {
                    setAntRegistryAddress(ANT_REGISTRY_ID);
                    setIsValidAntRegistryAddress(true);
                    dispatchGlobalState({
                      type: 'setAntRegistryProcessId',
                      payload: ANT_REGISTRY_ID,
                    });
                  }}
                >
                  <RotateCcw width={'16px'} />
                </button>
              </div>
            }
          />
        </div>

        <div className={inputContainerClass}>
          <div className="flex-row justify-between items-center text-white gap-2">
            <span className={labelClass}>
              Current Gateway:{' '}
              <span className="text-grey pl-2">{newGateway}</span>
            </span>
            <button
              className="border border-dark-grey flex flex-row bg-metallic-grey max-w-fit p-1 rounded-md text-white font-semibold hover:scale-105 transition-all text-sm p-2"
              onClick={() => setShowGatewayModal(true)}
              style={{ gap: '4px' }}
            >
              <List width={'18px'} height={'18px'} className="fill-white" />{' '}
              Choose AR.IO Gateway
            </button>
          </div>

          <Input
            className={inputClass}
            prefixCls="settings-input"
            placeholder="Enter custom gateway"
            value={newGateway}
            onChange={(e) => {
              setValidGateway(isValidGateway(e.target.value));
              setNewGateway(new URL(e.target.value).toString());
            }}
            onClear={() => setNewGateway('')}
            onPressEnter={(e) => updateGateway(e.currentTarget.value)}
            variant="outlined"
            status={validGateway ? '' : 'error'}
            addonAfter={
              <div className="flex flex-row" style={{ gap: '4px' }}>
                <button
                  disabled={!validGateway}
                  className={setButtonClass}
                  onClick={() => updateGateway(newGateway)}
                >
                  Set
                </button>
                <button
                  className={resetIconClass}
                  onClick={() => {
                    setNewGateway(
                      new URL(
                        `https://${NETWORK_DEFAULTS.ARWEAVE.HOST}`,
                      ).toString(),
                    );
                    setValidGateway(true);
                    updateGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
                  }}
                >
                  <RotateCcw width={'16px'} />
                </button>

                <SelectGatewayModal
                  show={showGatewayModal}
                  setShow={setShowGatewayModal}
                  setGateway={(g: string) => {
                    setNewGateway(g);
                    setValidGateway(true);
                    updateGateway(g);
                    setShowGatewayModal(false);
                  }}
                />
              </div>
            }
          />
        </div>

        <div className={inputContainerClass}>
          <span className={labelClass}>
            Current CU URL:{' '}
            <span className="text-grey pl-2">{aoNetwork.ARIO.CU_URL}</span>
          </span>
          <Input
            className={inputClass}
            prefixCls="settings-input"
            placeholder="Enter custom CU url"
            value={newCuUrl}
            onChange={(e) => {
              setValidCuUrl(isValidURL(e.target.value.trim()));
              setNewCuUrl(e.target.value.trim());
            }}
            onClear={() => setNewCuUrl('')}
            onPressEnter={(e) =>
              updateAoNetwork({
                CU_URL: e.currentTarget.value.trim(),
              })
            }
            variant="outlined"
            status={validCuUrl ? '' : 'error'}
            addonAfter={
              <div className="flex flex-row" style={{ gap: '4px' }}>
                <button
                  disabled={!validCuUrl}
                  className={setButtonClass}
                  onClick={() => updateAoNetwork({ CU_URL: newCuUrl.trim() })}
                >
                  Set
                </button>
                <button
                  className={resetIconClass}
                  onClick={() => {
                    setNewCuUrl(NETWORK_DEFAULTS.AO.ARIO.CU_URL);
                    setValidCuUrl(true);
                    updateAoNetwork({
                      CU_URL: NETWORK_DEFAULTS.AO.ARIO.CU_URL,
                    });
                  }}
                >
                  <RotateCcw width={'16px'} />
                </button>
              </div>
            }
          />
        </div>

        <div className={inputContainerClass}>
          <span className={labelClass}>
            Current MU URL:{' '}
            <span className="text-grey pl-2">{aoNetwork.ARIO.MU_URL}</span>
          </span>
          <Input
            className={inputClass}
            prefixCls="settings-input"
            placeholder="Enter custom MU url"
            value={newMuUrl}
            onChange={(e) => {
              setValidMuUrl(isValidURL(e.target.value.trim()));
              setNewMuUrl(e.target.value.trim());
            }}
            onClear={() => setNewMuUrl('')}
            onPressEnter={(e) =>
              updateAoNetwork({
                MU_URL: e.currentTarget.value.trim(),
              })
            }
            variant="outlined"
            status={validMuUrl ? '' : 'error'}
            addonAfter={
              <div className="flex flex-row" style={{ gap: '4px' }}>
                <button
                  disabled={!validMuUrl}
                  className={setButtonClass}
                  onClick={() => updateAoNetwork({ MU_URL: newMuUrl.trim() })}
                >
                  Set
                </button>
                <button
                  className={resetIconClass}
                  onClick={() => {
                    setNewMuUrl(NETWORK_DEFAULTS.AO.ARIO.MU_URL);
                    setValidMuUrl(true);
                    updateAoNetwork({
                      MU_URL: NETWORK_DEFAULTS.AO.ARIO.MU_URL,
                    });
                  }}
                >
                  <RotateCcw width={'16px'} />
                </button>
              </div>
            }
          />
        </div>

        <div className={inputContainerClass}>
          <div className="flex flex-row gap-2">
            <span className={labelClass}>
              Current SU Address:{' '}
              <span className="text-grey pl-2">
                <ArweaveID
                  id={new ArweaveTransactionID(aoNetwork.ARIO.SCHEDULER)}
                  shouldLink
                  type={ArweaveIdTypes.ADDRESS}
                  characterCount={16}
                />
              </span>
            </span>{' '}
            {suUrl ? (
              <span className={labelClass}>
                SU URL :&nbsp;
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
            )}
          </div>
          <Input
            className={inputClass}
            prefixCls="settings-input"
            placeholder="Enter custom SU address"
            value={newSuAddress}
            onChange={(e) => {
              setValidSuAddress(isArweaveTransactionID(e.target.value.trim()));
              setNewSuAddress(e.target.value.trim());
            }}
            onClear={() => setNewSuAddress('')}
            onPressEnter={(e) =>
              updateAoNetwork({
                SCHEDULER: e.currentTarget.value.trim(),
              })
            }
            variant="outlined"
            status={validSuAddress ? '' : 'error'}
            addonAfter={
              <div className="flex flex-row" style={{ gap: '4px' }}>
                <button
                  disabled={!validSuAddress}
                  className={setButtonClass}
                  onClick={() => updateAoNetwork({ SCHEDULER: newSuAddress })}
                >
                  Set
                </button>
                <button
                  className={resetIconClass}
                  onClick={() => {
                    setNewSuAddress(NETWORK_DEFAULTS.AO.ARIO.SCHEDULER);
                    setValidSuAddress(true);
                    updateAoNetwork({
                      SCHEDULER: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER,
                    });
                  }}
                >
                  <RotateCcw width={'16px'} />
                </button>
              </div>
            }
          />
        </div>
        <div className={inputContainerClass}>
          <span className={labelClass}>
            Current Hyperbeam URL:{' '}
            <span className="text-grey pl-2">{hyperbeamUrl || ''}</span>
            {!hyperbeamUrl && (
              <span className="text-red-500 font-bold pl-2">DISABLED</span>
            )}
          </span>
          <Input
            className={inputClass}
            prefixCls="settings-input"
            placeholder="https://hyperbeam.ario.permaweb.services"
            value={newHyperbeamUrl}
            onChange={(e) => {
              setValidHyperbeamUrl(isValidURL(e.target.value.trim()));
              setNewHyperbeamUrl(e.target.value);
            }}
            onClear={() => setNewHyperbeamUrl('')}
            onPressEnter={(e) =>
              dispatchGlobalState({
                type: 'setHyperbeamUrl',
                payload: e.currentTarget.value.trim(),
              })
            }
            variant="outlined"
            status={validHyperbeamUrl ? '' : 'error'}
            addonAfter={
              <div className="flex flex-row" style={{ gap: '4px' }}>
                <button
                  disabled={!validHyperbeamUrl}
                  className={setButtonClass}
                  onClick={() =>
                    dispatchGlobalState({
                      type: 'setHyperbeamUrl',
                      payload: newHyperbeamUrl.trim(),
                    })
                  }
                >
                  Set
                </button>
                <button
                  className={resetIconClass}
                  onClick={() => {
                    setNewHyperbeamUrl(
                      NETWORK_DEFAULTS.AO.ARIO.HYPERBEAM_URL || '',
                    );
                    setValidHyperbeamUrl(true);
                    dispatchGlobalState({
                      type: 'setHyperbeamUrl',
                      payload:
                        NETWORK_DEFAULTS.AO.ARIO.HYPERBEAM_URL || undefined,
                    });
                  }}
                >
                  <RotateCcw width={'16px'} />
                </button>
              </div>
            }
          />
        </div>

        <div className={inputContainerClass}>
          <div className="flex flex-row gap-2">
            <span className={labelClass}>
              Current Turbo Payment URL:{' '}
              <span className="text-grey pl-2">{newTurboPaymentUrl}</span>
            </span>
          </div>

          <Input
            className={inputClass}
            prefixCls="settings-input"
            placeholder="https://payment.ar.io"
            value={newTurboPaymentUrl}
            onChange={(e) => {
              setValidTurboPaymentUrl(isValidURL(e.target.value.trim()));
              setNewTurboPaymentUrl(e.target.value);
            }}
            onClear={() => setNewTurboPaymentUrl('')}
            onPressEnter={(e) =>
              updateTurboNetwork({
                PAYMENT_URL: e.currentTarget.value.trim(),
              })
            }
            variant="outlined"
            status={validTurboPaymentUrl ? '' : 'error'}
            addonAfter={
              <div className="flex flex-row" style={{ gap: '4px' }}>
                <button
                  disabled={!validTurboPaymentUrl}
                  className={setButtonClass}
                  onClick={() =>
                    updateTurboNetwork({
                      PAYMENT_URL: newTurboPaymentUrl.trim(),
                    })
                  }
                >
                  Set
                </button>
                <button
                  className={resetIconClass}
                  onClick={() => {
                    setNewTurboPaymentUrl(NETWORK_DEFAULTS.TURBO.PAYMENT_URL);
                    setValidTurboPaymentUrl(true);
                    updateTurboNetwork({
                      PAYMENT_URL: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
                      STRIPE_PUBLISHABLE_KEY:
                        NETWORK_DEFAULTS.TURBO.STRIPE_PUBLISHABLE_KEY,
                    });
                  }}
                >
                  <RotateCcw width={'16px'} />
                </button>
              </div>
            }
          />
        </div>
        <div className="flex flex-col p-2 w-wfull h-full justify-end items-end">
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
