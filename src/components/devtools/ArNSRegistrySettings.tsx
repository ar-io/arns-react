import {
  IO,
  IO_DEVNET_PROCESS_ID,
  IO_TESTNET_PROCESS_ID,
} from '@ar.io/sdk/web';
import { ArweaveCompositeDataProvider } from '@src/services/arweave/ArweaveCompositeDataProvider';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { SimpleArweaveDataProvider } from '@src/services/arweave/SimpleArweaveDataProvider';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { VALIDATION_INPUT_TYPES } from '@src/types';
import { isArweaveTransactionID } from '@src/utils';
import { IO_PROCESS_ID } from '@src/utils/constants';
import { Collapse, Space } from 'antd';
import Arweave from 'arweave';
import { useEffect, useState } from 'react';

import ValidationInput from '../inputs/text/ValidationInput/ValidationInput';
import './styles.css';

const Panel = Collapse.Panel;

function ArNSRegistrySettings() {
  const [{ arweaveDataProvider, ioProcessId }, dispatchGlobalState] =
    useGlobalState();
  const [{ wallet }] = useWalletState();
  const [registryAddress, setRegistryAddress] = useState<string>(
    ioProcessId?.toString(),
  );
  const [isValidAddress, setIsValidAddress] = useState<boolean>();

  useEffect(() => {
    setRegistryAddress(ioProcessId?.toString());
  }, [ioProcessId]);

  function confirmSetting(id: string) {
    if (isArweaveTransactionID(id)) {
      dispatchGlobalState({
        type: 'setIoProcessId',
        payload: new ArweaveTransactionID(id.trim()),
      });

      const arIOContract = IO.init({
        processId: id.trim(),
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
      const arweaveDataProvider = new SimpleArweaveDataProvider(arweave);
      const contract = IO.init({
        processId: id.trim(),
        // TODO: add signer,
      });
      const provider = new ArweaveCompositeDataProvider({
        contract,
        arweave: arweaveDataProvider,
      });

      dispatchGlobalState({
        type: 'setGateway',
        payload: { gateway, provider },
      });
    }
  }

  function reset() {
    confirmSetting(IO_PROCESS_ID?.toString());
  }

  return (
    <div className="flex" style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Collapse style={{ width: '100%' }} prefixCls="ario-collapse">
          <Panel
            header={
              <div className="flex" style={{ justifyContent: 'space-between' }}>
                <span>ArNS Registry Settings</span>
              </div>
            }
            key="1"
          >
            <>
              <div className="flex" style={{ gap: '4px' }}>
                <button
                  className={
                    'center ' +
                    (ioProcessId?.toString() === IO_DEVNET_PROCESS_ID
                      ? 'button-primary'
                      : 'button-secondary')
                  }
                  style={{ padding: '4px' }}
                  onClick={() => confirmSetting(IO_DEVNET_PROCESS_ID)}
                >
                  devnet
                </button>
                <button
                  className={
                    'center ' +
                    (ioProcessId?.toString() === IO_TESTNET_PROCESS_ID
                      ? 'button-primary'
                      : 'button-secondary')
                  }
                  style={{ padding: '4px' }}
                  onClick={() => confirmSetting(IO_TESTNET_PROCESS_ID)}
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
              <span className="grey text-medium">
                ArNS Registry: {ioProcessId?.toString()}
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
