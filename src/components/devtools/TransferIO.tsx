import { ArIOWritable } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { VALIDATION_INPUT_TYPES } from '@src/types';
import { formatIO, isArweaveTransactionID, mioToIo } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { Collapse, Space } from 'antd';
import { useEffect, useState } from 'react';

import ValidationInput from '../inputs/text/ValidationInput/ValidationInput';
import './styles.css';

const Panel = Collapse.Panel;

function TransferIO() {
  const [{ arweaveDataProvider, arioContract, arnsContractId }] =
    useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [ioBalance, setIoBalance] = useState<number>(0);
  const [toAddress, setToAddress] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [transfering, setTransfering] = useState<boolean>(false);

  useEffect(() => {
    if (walletAddress) {
      setLoading(true);
      arioContract
        .getBalance({ address: walletAddress?.toString() })
        .then((balance) => {
          setIoBalance(balance);
        })
        .catch((e) => console.error(e))
        .finally(() => {
          setLoading(false);
        });
    }
  }, [arnsContractId, walletAddress, arioContract]);

  async function confirmTransfer() {
    try {
      setTransfering(true);
      console.log(isArweaveTransactionID(toAddress.trim()));
      console.log(arioContract);
      if (isArweaveTransactionID(toAddress.trim())) {
        console.log('transfering', toAddress.trim(), quantity);
        const contract = arioContract as ArIOWritable;
        const tx = await contract.transfer({
          target: toAddress.trim(),
          qty: quantity,
        });
        alert(`Transfer of ${quantity} successful: ${tx.id}`);
      }
    } catch (error) {
      eventEmitter.emit('error', error);
      console.error(error);
    } finally {
      setTransfering(false);
    }
  }

  return (
    <div className="flex" style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Collapse style={{ width: '100%' }} prefixCls="ario-collapse">
          <Panel header={<span>Transfer IO</span>} key="1">
            <>
              <span className="grey text-medium">
                Recipient wallet address:
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
                value={toAddress}
                setValue={setToAddress}
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
              <span className="grey text-medium">
                Amount: {formatIO(quantity)}
              </span>
              <ValidationInput
                catchInvalidInput={true}
                inputClassName={'domain-settings-input'}
                inputType="number"
                inputCustomStyle={{
                  background: 'var(--card-bg)',
                  borderRadius: 'var(--corner-radius)',
                  border: '1px solid var(--text-faded)',
                  padding: '15px',
                }}
                placeholder={'Quantity in IO to send'}
                value={quantity}
                setValue={(e) => setQuantity(parseInt(e?.toString()))}
                validationPredicates={{}}
              />
              <span style={{ color: 'var(--accent)' }}>
                {loading
                  ? 'Loading balance...'
                  : `Balance: ${formatIO(Math.round(mioToIo(ioBalance)))} IO`}
              </span>
              <button
                className="button-secondary center"
                style={{ width: '100%', marginTop: '5px' }}
                onClick={confirmTransfer}
              >
                {transfering ? 'Transfering...' : 'Confirm'}
              </button>
            </>
          </Panel>
        </Collapse>
      </Space>
    </div>
  );
}

export default TransferIO;
