import { AOProcess, ARIO } from '@ar.io/sdk/web';
import { connect } from '@permaweb/aoconnect';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import {
  dispatchArIOContract,
  dispatchNewGateway,
  useWalletState,
} from '@src/state';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { isArweaveTransactionID, isValidGateway, isValidURL } from '@src/utils';
import {
  NETWORK_DEFAULTS,
  devStripePublishableKey,
  prodStripePublishableKey,
} from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { Collapse, Input, Space } from 'antd';
import { List } from 'lucide-react';
import { useEffect, useState } from 'react';

import ArweaveID, { ArweaveIdTypes } from '../layout/ArweaveID/ArweaveID';
import SelectGatewayModal from './SelectGatewayModal/SelectGatewayModal';
import './styles.css';

const Panel = Collapse.Panel;

function NetworkSettings() {
  const [
    { gateway, aoNetwork, arioProcessId, arioContract, turboNetwork },
    dispatchGlobalState,
  ] = useGlobalState();
  const [{ wallet }] = useWalletState();
  const [newGateway, setNewGateway] = useState<string>(gateway);
  const [validGateway, setValidGateway] = useState<boolean>(true);

  const [newARIOCuUrl, setNewARIOCuUrl] = useState<string>(
    aoNetwork.ARIO.CU_URL,
  );
  const [validARIOCuUrl, setValidARIOCuUrl] = useState<boolean>(true);

  const [newANTCuUrl, setNewANTCuUrl] = useState<string>(aoNetwork.ANT.CU_URL);
  const [validANTCuUrl, setValidANTCuUrl] = useState<boolean>(true);

  const [newMuUrl, setNewMuUrl] = useState<string>(
    NETWORK_DEFAULTS.AO.ARIO.MU_URL,
  );
  const [validMuUrl, setValidMuUrl] = useState<boolean>(true);
  const [newSuAddress, setNewSuAddress] = useState<string>(
    NETWORK_DEFAULTS.AO.ARIO.SCHEDULER,
  );
  const [validSuAddress, setValidSuAddress] = useState<boolean>(true);
  const [showGatewayModal, setShowGatewayModal] = useState<boolean>(false);

  const [newTurboPaymentUrl, setNewTurboPaymentUrl] = useState<string>(
    turboNetwork.PAYMENT_URL,
  );
  const [validTurboPaymentUrl, setValidTurboPaymentUrl] =
    useState<boolean>(true);

  function reset() {
    // gateway
    setNewGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
    setValidGateway(true);
    updateGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
    // ao network
    setNewARIOCuUrl(NETWORK_DEFAULTS.AO.ARIO.CU_URL);
    setValidARIOCuUrl(true);
    setNewMuUrl(NETWORK_DEFAULTS.AO.ARIO.MU_URL);
    setValidMuUrl(true);
    setNewSuAddress(NETWORK_DEFAULTS.AO.ARIO.SCHEDULER);
    setValidSuAddress(true);
    updateARIOAoNetwork({
      CU_URL: NETWORK_DEFAULTS.AO.ARIO.CU_URL,
      MU_URL: NETWORK_DEFAULTS.AO.ARIO.MU_URL,
      SCHEDULER: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER,
    });
    // turbo network
    setNewTurboPaymentUrl(NETWORK_DEFAULTS.TURBO.PAYMENT_URL);
    setValidTurboPaymentUrl(true);
    updateTurboNetwork(NETWORK_DEFAULTS.TURBO);
  }

  useEffect(() => {
    setNewGateway(gateway);
    setValidGateway(true);
  }, [gateway]);

  useEffect(() => {
    setNewARIOCuUrl(aoNetwork.ARIO.CU_URL);
    setValidARIOCuUrl(true);
    setNewMuUrl(aoNetwork.ARIO.MU_URL);
    setValidMuUrl(true);
    setNewSuAddress(aoNetwork.ARIO.SCHEDULER);
    setValidSuAddress(true);
  }, [aoNetwork.ARIO]);

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
      if (wallet) dispatchNewGateway(gate, arioContract, dispatchGlobalState);
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

  function updateARIOAoNetwork(config: {
    CU_URL?: string;
    MU_URL?: string;
    SCHEDULER?: string;
  }) {
    try {
      const newConfig = {
        ...aoNetwork,
        ...{ ARIO: { ...aoNetwork.ARIO, ...config, GATEWAY_URL: gateway } },
      };
      dispatchGlobalState({
        type: 'setAONetwork',
        payload: newConfig,
      });

      const ao = connect({
        GATEWAY_URL: 'https://' + gateway,
        CU_URL: newConfig.ARIO.CU_URL,
        MU_URL: newConfig.ARIO.MU_URL,
      });
      dispatchGlobalState({
        type: 'setARIOAoClient',
        payload: ao,
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

  function updateANTAoNetwork(config: { CU_URL?: string }) {
    try {
      const newConfig = {
        ...aoNetwork,
        ...{ ANT: { ...aoNetwork.ANT, ...config } },
      };
      dispatchGlobalState({
        type: 'setAONetwork',
        payload: newConfig,
      });

      const ao = connect({
        GATEWAY_URL: 'https://' + gateway,
        CU_URL: newConfig.ANT.CU_URL,
      });
      dispatchGlobalState({
        type: 'setANTAoClient',
        payload: ao,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  function updateTurboNetwork(config: typeof NETWORK_DEFAULTS.TURBO) {
    dispatchGlobalState({ type: 'setTurboNetwork', payload: config });
    dispatchArIOContract({
      contract: ARIO.init({
        paymentUrl: config.PAYMENT_URL,
        signer: wallet!.turboSigner!,
        process: new AOProcess({
          processId: arioProcessId,
          ao: connect(aoNetwork.ARIO),
        }),
      }),
      arioProcessId,
      dispatch: dispatchGlobalState,
    });
  }

  return (
    <div className="flex" style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Collapse style={{ width: '100%' }} prefixCls="ario-collapse">
          <Panel
            header={
              <div className="flex" style={{ justifyContent: 'space-between' }}>
                <span>Network Settings</span>
              </div>
            }
            key="1"
          >
            <>
              <div className="flex flex-row justify-between items-center text-white">
                {' '}
                <span className="flex w-fit justify-center items-center bg-primary-thin rounded-t-md px-4 py-1 border-x-2 border-t-2 border-primary text-md text-primary font-semibold mt-2">
                  Gateway: <span className="text-white pl-2">{gateway}</span>
                </span>
                <button
                  className="border-2 border-primary flex flex-row bg-metallic-grey max-w-fit p-1 rounded-md text-white font-semibold "
                  onClick={() => setShowGatewayModal(true)}
                  style={{ gap: '5px' }}
                >
                  <List width={'18px'} height={'18px'} className="fill-white" />{' '}
                  Choose AR.IO Gateway
                </button>
              </div>

              <Input
                className="bg-background justify-center items-center"
                addonBefore="https://"
                placeholder="Enter custom gateway"
                value={newGateway}
                onChange={(e) => {
                  setValidGateway(isValidGateway(e.target.value));
                  setNewGateway(e.target.value);
                }}
                onClear={() => setNewGateway('')}
                onPressEnter={(e) => updateGateway(e.currentTarget.value)}
                variant="outlined"
                status={validGateway ? '' : 'error'}
                addonAfter={
                  <div className="flex flex-row" style={{ gap: '5px' }}>
                    <button
                      disabled={!validGateway}
                      className="bg-primary text-black h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() => updateGateway(newGateway)}
                    >
                      Set Gateway
                    </button>
                    <button
                      className="bg-primary-thin text-white h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() => {
                        setNewGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
                        setValidGateway(true);
                        updateGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
                      }}
                    >
                      reset
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
              <span className="flex w-fit justify-center items-center bg-primary-thin rounded-t-md px-4 py-1 border-x-2 border-t-2 border-primary text-md text-primary font-semibold mt-2">
                ARIO CU URL:{' '}
                <span className="text-white pl-2">{aoNetwork.ARIO.CU_URL}</span>
              </span>
              <Input
                className="bg-background justify-center items-center"
                placeholder="Enter custom CU url"
                value={newARIOCuUrl}
                onChange={(e) => {
                  setValidARIOCuUrl(isValidURL(e.target.value.trim()));
                  setNewARIOCuUrl(e.target.value.trim());
                }}
                onClear={() => setNewARIOCuUrl('')}
                onPressEnter={(e) =>
                  updateARIOAoNetwork({
                    CU_URL: e.currentTarget.value.trim(),
                  })
                }
                variant="outlined"
                status={validARIOCuUrl ? '' : 'error'}
                addonAfter={
                  <div className="flex flex-row" style={{ gap: '5px' }}>
                    <button
                      disabled={!validARIOCuUrl}
                      className="bg-primary text-black h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() =>
                        updateARIOAoNetwork({ CU_URL: newARIOCuUrl.trim() })
                      }
                    >
                      Set ARIO CU url
                    </button>
                    <button
                      className="bg-primary-thin text-white h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() => {
                        setNewARIOCuUrl(NETWORK_DEFAULTS.AO.ARIO.CU_URL);
                        setValidARIOCuUrl(true);
                        updateARIOAoNetwork({
                          CU_URL: NETWORK_DEFAULTS.AO.ARIO.CU_URL,
                        });
                      }}
                    >
                      reset
                    </button>
                  </div>
                }
              />
              <span className="flex w-fit justify-center items-center bg-primary-thin rounded-t-md px-4 py-1 border-x-2 border-t-2 border-primary text-md text-primary font-semibold mt-2">
                ANT CU URL:{' '}
                <span className="text-white pl-2">{aoNetwork.ANT.CU_URL}</span>
              </span>
              <Input
                className="bg-background justify-center items-center"
                placeholder="Enter custom CU url"
                value={newANTCuUrl}
                onChange={(e) => {
                  setValidANTCuUrl(isValidURL(e.target.value.trim()));
                  setNewANTCuUrl(e.target.value.trim());
                }}
                onClear={() => setNewANTCuUrl('')}
                onPressEnter={(e) =>
                  updateANTAoNetwork({
                    CU_URL: e.currentTarget.value.trim(),
                  })
                }
                variant="outlined"
                status={validANTCuUrl ? '' : 'error'}
                addonAfter={
                  <div className="flex flex-row" style={{ gap: '5px' }}>
                    <button
                      disabled={!validANTCuUrl}
                      className="bg-primary text-black h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() =>
                        updateANTAoNetwork({ CU_URL: newANTCuUrl.trim() })
                      }
                    >
                      Set ANT CU url
                    </button>
                    <button
                      className="bg-primary-thin text-white h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() => {
                        setNewANTCuUrl(NETWORK_DEFAULTS.AO.ANT.CU_URL);
                        setValidANTCuUrl(true);
                        updateANTAoNetwork({
                          CU_URL: NETWORK_DEFAULTS.AO.ANT.CU_URL,
                        });
                      }}
                    >
                      reset
                    </button>
                  </div>
                }
              />
              <span className="flex w-fit justify-center items-center bg-primary-thin rounded-t-md px-4 py-1 border-x-2 border-t-2 border-primary text-md text-primary font-semibold mt-2">
                MU URL:{' '}
                <span className="text-white pl-2">{aoNetwork.ARIO.MU_URL}</span>
              </span>
              <Input
                className="bg-background justify-center items-center"
                placeholder="Enter custom MU url"
                value={newMuUrl}
                onChange={(e) => {
                  setValidMuUrl(isValidURL(e.target.value.trim()));
                  setNewMuUrl(e.target.value.trim());
                }}
                onClear={() => setNewARIOCuUrl('')}
                onPressEnter={(e) =>
                  updateARIOAoNetwork({
                    MU_URL: e.currentTarget.value.trim(),
                  })
                }
                variant="outlined"
                status={validMuUrl ? '' : 'error'}
                addonAfter={
                  <div className="flex flex-row" style={{ gap: '5px' }}>
                    <button
                      disabled={!validMuUrl}
                      className="bg-primary text-black h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() =>
                        updateARIOAoNetwork({ MU_URL: newMuUrl.trim() })
                      }
                    >
                      Set MU url
                    </button>
                    <button
                      className="bg-primary-thin text-white h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() => {
                        setNewMuUrl(NETWORK_DEFAULTS.AO.ARIO.MU_URL);
                        setValidMuUrl(true);
                        updateARIOAoNetwork({
                          MU_URL: NETWORK_DEFAULTS.AO.ARIO.MU_URL,
                        });
                      }}
                    >
                      reset
                    </button>
                  </div>
                }
              />
              <span className="flex w-fit justify-center items-center bg-primary-thin rounded-t-md px-4 py-1 border-x-2 border-t-2 border-primary text-md text-primary font-semibold mt-2">
                SU Address:{' '}
                <span className="text-white pl-2">
                  <ArweaveID
                    id={new ArweaveTransactionID(aoNetwork.ARIO.SCHEDULER)}
                    shouldLink
                    type={ArweaveIdTypes.ADDRESS}
                    characterCount={16}
                  />
                </span>
              </span>
              <Input
                className="bg-background justify-center items-center"
                placeholder="Enter custom SU address"
                value={newSuAddress}
                onChange={(e) => {
                  setValidSuAddress(
                    isArweaveTransactionID(e.target.value.trim()),
                  );
                  setNewSuAddress(e.target.value.trim());
                }}
                onClear={() => setNewSuAddress('')}
                onPressEnter={(e) =>
                  updateARIOAoNetwork({
                    SCHEDULER: e.currentTarget.value.trim(),
                  })
                }
                variant="outlined"
                status={validSuAddress ? '' : 'error'}
                addonAfter={
                  <div className="flex flex-row" style={{ gap: '5px' }}>
                    <button
                      disabled={!validSuAddress}
                      className="bg-primary text-black h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() =>
                        updateARIOAoNetwork({ SCHEDULER: newSuAddress })
                      }
                    >
                      Set Scheduler Address
                    </button>
                    <button
                      className="bg-primary-thin text-white h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() => {
                        setNewSuAddress(NETWORK_DEFAULTS.AO.ARIO.SCHEDULER);
                        setValidSuAddress(true);
                        updateARIOAoNetwork({
                          SCHEDULER: NETWORK_DEFAULTS.AO.ARIO.SCHEDULER,
                        });
                      }}
                    >
                      reset
                    </button>
                  </div>
                }
              />

              <span className="flex w-fit justify-center items-center bg-primary-thin rounded-t-md px-4 py-1 border-x-2 border-t-2 border-primary text-md text-primary font-semibold mt-2 gap-2">
                Turbo Payment URL:{' '}
                <span className="text-white pl-2">
                  {turboNetwork.PAYMENT_URL}
                </span>
                <button
                  data-network={
                    turboNetwork.PAYMENT_URL.includes('ardrive.dev')
                      ? 'testnet'
                      : 'mainnet'
                  }
                  className="bg-foreground text-white h-full flex w-fit p-1 rounded-sm text-xs hover:bg-primary-thin border border-primary-thin hover:border-primary data-[network=testnet]:bg-primary data-[network=testnet]:text-black data-[network=testnet]:border-primary-thin data-[network=testnet]:hover:bg-primary-thin data-[network=testnet]:hover:border-primary"
                  onClick={() => {
                    setNewTurboPaymentUrl('https://payment.ardrive.dev');
                    setValidTurboPaymentUrl(true);
                    updateTurboNetwork({
                      PAYMENT_URL: 'https://payment.ardrive.dev',
                      UPLOAD_URL: turboNetwork.UPLOAD_URL,
                      GATEWAY_URL: turboNetwork.GATEWAY_URL,
                      WALLETS_URL: turboNetwork.WALLETS_URL,
                      STRIPE_PUBLISHABLE_KEY: devStripePublishableKey,
                    });
                  }}
                >
                  Turbo Dev
                </button>
                <button
                  data-network={
                    turboNetwork.PAYMENT_URL.includes('ardrive.dev')
                      ? 'testnet'
                      : 'mainnet'
                  }
                  className="bg-foreground text-white h-full flex w-fit p-1 rounded-sm text-xs hover:bg-primary-thin border border-primary-thin hover:border-primary data-[network=mainnet]:bg-primary data-[network=mainnet]:text-black data-[network=mainnet]:border-primary-thin data-[network=mainnet]:hover:bg-primary-thin data-[network=mainnet]:hover:border-primary"
                  onClick={() => {
                    setNewTurboPaymentUrl(`https://payment.ardrive.io`);
                    setValidTurboPaymentUrl(true);
                    updateTurboNetwork({
                      PAYMENT_URL: `https://payment.ardrive.io`,
                      UPLOAD_URL: turboNetwork.UPLOAD_URL,
                      GATEWAY_URL: turboNetwork.GATEWAY_URL,
                      WALLETS_URL: turboNetwork.WALLETS_URL,
                      STRIPE_PUBLISHABLE_KEY: prodStripePublishableKey,
                    });
                  }}
                >
                  Turbo Prod
                </button>
              </span>
              <Input
                className="bg-background justify-center items-center"
                placeholder="Enter custom Turbo payment url"
                value={newTurboPaymentUrl}
                onChange={(e) => {
                  setValidTurboPaymentUrl(isValidURL(e.target.value.trim()));
                  setNewTurboPaymentUrl(e.target.value.trim());
                }}
                onClear={() => setNewTurboPaymentUrl('')}
                onPressEnter={(e) =>
                  updateTurboNetwork({
                    PAYMENT_URL: e.currentTarget.value.trim(),
                    UPLOAD_URL: turboNetwork.UPLOAD_URL,
                    GATEWAY_URL: turboNetwork.GATEWAY_URL,
                    WALLETS_URL: turboNetwork.WALLETS_URL,
                    STRIPE_PUBLISHABLE_KEY: turboNetwork.STRIPE_PUBLISHABLE_KEY,
                  })
                }
                variant="outlined"
                status={validTurboPaymentUrl ? '' : 'error'}
                addonAfter={
                  <div className="flex flex-row" style={{ gap: '5px' }}>
                    <button
                      disabled={!validTurboPaymentUrl}
                      className="bg-primary text-black h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() =>
                        updateTurboNetwork({
                          PAYMENT_URL: newTurboPaymentUrl.trim(),
                          UPLOAD_URL: turboNetwork.UPLOAD_URL,
                          GATEWAY_URL: turboNetwork.GATEWAY_URL,
                          WALLETS_URL: turboNetwork.WALLETS_URL,
                          STRIPE_PUBLISHABLE_KEY:
                            turboNetwork.STRIPE_PUBLISHABLE_KEY,
                        })
                      }
                    >
                      Set Turbo Payment URL
                    </button>
                    <button
                      className="bg-primary-thin text-white h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() => {
                        setNewTurboPaymentUrl(
                          NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
                        );
                        setValidTurboPaymentUrl(true);
                        updateTurboNetwork(NETWORK_DEFAULTS.TURBO);
                      }}
                    >
                      reset
                    </button>
                  </div>
                }
              />
              <div className="flex flex-row p-2 justify-end items-center">
                <button
                  className="p-2 text-white border-2 border-black hover:bg-primary hover:text-black bg-primary-thin rounded-md font-bold"
                  onClick={reset}
                >
                  RESET
                </button>
              </div>
            </>
          </Panel>
        </Collapse>
      </Space>
    </div>
  );
}

export default NetworkSettings;
