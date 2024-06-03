import {
  ARNS_DEVNET_REGISTRY_TX,
  ARNS_TESTNET_REGISTRY_TX,
  ArIO,
} from '@ar.io/sdk/web';
import { ARNSContractCache } from '@src/services/arweave/ARNSContractCache';
import { ArweaveCompositeDataProvider } from '@src/services/arweave/ArweaveCompositeDataProvider';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { SimpleArweaveDataProvider } from '@src/services/arweave/SimpleArweaveDataProvider';
import { WarpDataProvider } from '@src/services/arweave/WarpDataProvider';
import { ArConnectWalletConnector } from '@src/services/wallets';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { VALIDATION_INPUT_TYPES } from '@src/types';
import { isArweaveTransactionID } from '@src/utils';
import { ARNS_REGISTRY_ADDRESS, ARNS_SERVICE_API } from '@src/utils/constants';
import { Collapse, Space } from 'antd';
import Arweave from 'arweave';
import { useEffect, useState } from 'react';

import ValidationInput from '../inputs/text/ValidationInput/ValidationInput';
import './styles.css';

const Panel = Collapse.Panel;

function ArNSRegistrySettings() {
  const [{ arweaveDataProvider, arnsContractId }, dispatchGlobalState] =
    useGlobalState();
  const [{ wallet }] = useWalletState();
  const [registryAddress, setRegistryAddress] = useState<string>(
    arnsContractId?.toString(),
  );
  const [isValidAddress, setIsValidAddress] = useState<boolean>();

  useEffect(() => {
    setRegistryAddress(arnsContractId?.toString());
  }, [arnsContractId]);

  function confirmSetting(id: string) {
    if (isArweaveTransactionID(id)) {
      dispatchGlobalState({
        type: 'setArNSContractId',
        payload: new ArweaveTransactionID(id.trim()),
      });

      const arIOContract = ArIO.init({
        contractTxId: id.trim(),
        ...(wallet?.arconnectSigner ? { signer: wallet.arconnectSigner } : {}),
      });
      dispatchGlobalState({
        type: 'setArIOContract',
        payload: arIOContract,
      });

      const gateway = 'ar-io.dev';
      const arweave = new Arweave({
        host: gateway,
        protocol: 'https',
      });
      const warpDataProvider = new WarpDataProvider(
        arweave,
        wallet ?? new ArConnectWalletConnector(),
      );
      const arweaveDataProvider = new SimpleArweaveDataProvider(arweave);
      const contractCacheProviders = new ARNSContractCache({
        url: ARNS_SERVICE_API,
        arweave: arweaveDataProvider,
        arioContract: arIOContract,
      });

      const provider = new ArweaveCompositeDataProvider(
        arweaveDataProvider,
        warpDataProvider,
        contractCacheProviders,
      );

      dispatchGlobalState({
        type: 'setGateway',
        payload: { gateway, provider },
      });
    }
  }

  function reset() {
    confirmSetting(ARNS_REGISTRY_ADDRESS?.toString());
  }

  return (
    <div className="flex" style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Collapse style={{ width: '100%' }} prefixCls="ario-collapse">
          <Panel
            header={
              <div className="flex" style={{ justifyContent: 'space-between' }}>
                <span>ArNS Registry Settings</span>
                <div className="flex" style={{ gap: '4px' }}>
                  <button
                    className={
                      'center ' +
                      (arnsContractId?.toString() === ARNS_DEVNET_REGISTRY_TX
                        ? 'button-primary'
                        : 'button-secondary')
                    }
                    style={{ padding: '4px' }}
                    onClick={() => confirmSetting(ARNS_DEVNET_REGISTRY_TX)}
                  >
                    devnet
                  </button>
                  <button
                    className={
                      'center ' +
                      (arnsContractId?.toString() === ARNS_TESTNET_REGISTRY_TX
                        ? 'button-primary'
                        : 'button-secondary')
                    }
                    style={{ padding: '4px' }}
                    onClick={() => confirmSetting(ARNS_TESTNET_REGISTRY_TX)}
                  >
                    testnet
                  </button>
                  <button
                    className="outline-button center"
                    style={{
                      borderColor: 'white',
                      padding: '4px',
                      width: 'fit-content',
                      minWidth: '0',
                    }}
                    onClick={reset}
                  >
                    reset
                  </button>
                </div>
              </div>
            }
            key="1"
          >
            <>
              <span className="grey text-medium">
                ArNS Registry: {arnsContractId?.toString()}
              </span>
              <ValidationInput
                placeholder="Enter recipient wallet address"
                inputClassName="name-token-input white"
                inputCustomStyle={{ paddingLeft: '10px', fontSize: '16px' }}
                wrapperCustomStyle={{
                  position: 'relative',
                  border: '1px solid var(--text-faded)',
                  borderRadius: 'var(--corner-radius)',
                }}
                showValidationIcon={true}
                showValidationOutline={true}
                showValidationChecklist={true}
                validationListStyle={{ display: 'none' }}
                maxCharLength={43}
                value={registryAddress}
                setValue={setRegistryAddress}
                validityCallback={(validity: boolean) =>
                  setIsValidAddress(validity)
                }
                validationPredicates={{
                  [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                    fn: (id: string) =>
                      arweaveDataProvider.validateArweaveId(id),
                  },
                  [VALIDATION_INPUT_TYPES.ARWEAVE_ADDRESS]: {
                    fn: (id: string) =>
                      arweaveDataProvider.validateArweaveAddress(id),
                    required: false,
                  },
                }}
              />
              {isValidAddress === false ? (
                <span
                  className="text-color-error"
                  style={{ marginBottom: '10px' }}
                >
                  invalid address
                </span>
              ) : (
                <></>
              )}
              <button
                className="button-secondary center"
                style={{ width: '100%', marginTop: '5px' }}
                onClick={() => confirmSetting(registryAddress)}
              >
                Set Registry Address
              </button>
            </>
          </Panel>
        </Collapse>
      </Space>
    </div>
  );
}

export default ArNSRegistrySettings;
