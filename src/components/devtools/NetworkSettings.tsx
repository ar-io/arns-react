import { AOProcess, IO } from '@ar.io/sdk';
import { connect } from '@permaweb/aoconnect';
import useGateways from '@src/hooks/useGateways';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import {
  dispatchArIOContract,
  dispatchNewGateway,
  useWalletState,
} from '@src/state';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { isArweaveTransactionID, isValidGateway, isValidURL } from '@src/utils';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { Collapse, Input, Space } from 'antd';
import { useEffect, useState } from 'react';

import ArweaveID, { ArweaveIdTypes } from '../layout/ArweaveID/ArweaveID';
import './styles.css';

const Panel = Collapse.Panel;

function NetworkSettings() {
  const [
    { arweaveDataProvider, gateway, aoNetwork, ioProcessId },
    dispatchGlobalState,
  ] = useGlobalState();
  const [{ wallet }] = useWalletState();
  const { data: gateways } = useGateways();
  const [newGateway, setNewGateway] = useState<string>(gateway);
  const [validGateway, setValidGateway] = useState<boolean>(true);
  const [newCuUrl, setNewCuUrl] = useState<string>(NETWORK_DEFAULTS.AO.CU_URL);
  const [validCuUrl, setValidCuUrl] = useState<boolean>(true);
  const [newMuUrl, setNewMuUrl] = useState<string>(NETWORK_DEFAULTS.AO.MU_URL);
  const [validMuUrl, setValidMuUrl] = useState<boolean>(true);
  const [newSuAddress, setNewSuAddress] = useState<string>(
    NETWORK_DEFAULTS.AO.SCHEDULER,
  );
  const [validSuAddress, setValidSuAddress] = useState<boolean>(true);

  function reset() {
    // gateway
    setNewGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
    setValidGateway(true);
    updateGateway(NETWORK_DEFAULTS.ARWEAVE.HOST);
    // ao network
    setNewCuUrl(NETWORK_DEFAULTS.AO.CU_URL);
    setValidCuUrl(true);
    setNewMuUrl(NETWORK_DEFAULTS.AO.MU_URL);
    setValidMuUrl(true);
    setNewSuAddress(NETWORK_DEFAULTS.AO.SCHEDULER);
    setValidSuAddress(true);
    updateAoNetwork({
      CU_URL: NETWORK_DEFAULTS.AO.CU_URL,
      MU_URL: NETWORK_DEFAULTS.AO.MU_URL,
      SCHEDULER: NETWORK_DEFAULTS.AO.SCHEDULER,
    });
  }

  useEffect(() => {
    setNewGateway(gateway);
    setValidGateway(true);
  }, [gateway]);

  useEffect(() => {
    setNewCuUrl(aoNetwork.CU_URL);
    setValidCuUrl(true);
    setNewMuUrl(aoNetwork.MU_URL);
    setValidMuUrl(true);
    setNewSuAddress(aoNetwork.SCHEDULER);
    setValidSuAddress(true);
  }, [aoNetwork]);

  function updateGateway(gate: string) {
    try {
      if (!isValidGateway(gate)) {
        throw new Error('Invalid gateway: ' + gate);
      }
      if (wallet) dispatchNewGateway(gate, wallet, dispatchGlobalState);
    } catch (error) {
      eventEmitter.emit('error', error);
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
        ...config,
        GATEWAY_URL: gateway,
      };
      dispatchGlobalState({
        type: 'setAONetwork',
        payload: newConfig,
      });
      const ao = connect({
        GATEWAY_URL: gateway,
        CU_URL: newConfig.CU_URL,
        MU_URL: newConfig.MU_URL,
      });
      dispatchArIOContract({
        contract: IO.init({
          process: new AOProcess({
            processId: ioProcessId.toString(),
            ao,
          }),
        }),
        ioProcessId,
        dispatch: dispatchGlobalState,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
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
              <span className="flex w-fit justify-center items-center bg-primary-thin rounded-t-md px-4 py-1 border-x-2 border-t-2 border-primary text-md text-primary font-semibold mt-2">
                Gateway: <span className="text-white pl-2">{gateway}</span>
              </span>
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
                  </div>
                }
              />
              <span className="flex w-fit justify-center items-center bg-primary-thin rounded-t-md px-4 py-1 border-x-2 border-t-2 border-primary text-md text-primary font-semibold mt-2">
                CU URL:{' '}
                <span className="text-white pl-2">{aoNetwork.CU_URL}</span>
              </span>
              <Input
                className="bg-background justify-center items-center"
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
                  <div className="flex flex-row" style={{ gap: '5px' }}>
                    <button
                      disabled={!validCuUrl}
                      className="bg-primary text-black h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() =>
                        updateAoNetwork({ CU_URL: newCuUrl.trim() })
                      }
                    >
                      Set CU url
                    </button>
                    <button
                      className="bg-primary-thin text-white h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() => {
                        setNewCuUrl(NETWORK_DEFAULTS.AO.CU_URL);
                        setValidCuUrl(true);
                        updateAoNetwork({ CU_URL: NETWORK_DEFAULTS.AO.CU_URL });
                      }}
                    >
                      reset
                    </button>
                  </div>
                }
              />
              <span className="flex w-fit justify-center items-center bg-primary-thin rounded-t-md px-4 py-1 border-x-2 border-t-2 border-primary text-md text-primary font-semibold mt-2">
                MU URL:{' '}
                <span className="text-white pl-2">{aoNetwork.MU_URL}</span>
              </span>
              <Input
                className="bg-background justify-center items-center"
                placeholder="Enter custom MU url"
                value={newMuUrl}
                onChange={(e) => {
                  setValidMuUrl(isValidURL(e.target.value.trim()));
                  setNewMuUrl(e.target.value.trim());
                }}
                onClear={() => setNewCuUrl('')}
                onPressEnter={(e) =>
                  updateAoNetwork({
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
                        updateAoNetwork({ MU_URL: newMuUrl.trim() })
                      }
                    >
                      Set MU url
                    </button>
                    <button
                      className="bg-primary-thin text-white h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() => {
                        setNewMuUrl(NETWORK_DEFAULTS.AO.MU_URL);
                        setValidMuUrl(true);
                        updateAoNetwork({ MU_URL: NETWORK_DEFAULTS.AO.MU_URL });
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
                    id={new ArweaveTransactionID(aoNetwork.SCHEDULER)}
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
                  updateAoNetwork({
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
                        updateAoNetwork({ SCHEDULER: newSuAddress })
                      }
                    >
                      Set Scheduler Address
                    </button>
                    <button
                      className="bg-primary-thin text-white h-full flex w-fit p-1 rounded-sm text-xs"
                      onClick={() => {
                        setNewSuAddress(NETWORK_DEFAULTS.AO.SCHEDULER);
                        setValidSuAddress(true);
                        updateAoNetwork({
                          SCHEDULER: NETWORK_DEFAULTS.AO.SCHEDULER,
                        });
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
