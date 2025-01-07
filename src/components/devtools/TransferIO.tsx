import { ARIOToken, AoARIOWrite, mARIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { VALIDATION_INPUT_TYPES } from '@src/types';
import { formatARIO, isValidAoAddress, mioToIo } from '@src/utils';
import { WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { Collapse, Space } from 'antd';
import { useEffect, useState } from 'react';

import ValidationInput from '../inputs/text/ValidationInput/ValidationInput';
import './styles.css';

const Panel = Collapse.Panel;

function TransferIO() {
  const [{ arioContract, arioProcessId, arioTicker }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [ioBalance, setIoBalance] = useState<number>(0);
  const [toAddress, setToAddress] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  // store as mio, display as io
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
  }, [arioProcessId, walletAddress, arioContract]);

  async function confirmTransfer() {
    try {
      setTransfering(true);
      if (isValidAoAddress(toAddress.trim())) {
        // TODO: check that is a write contract
        const contract = arioContract as AoARIOWrite;
        const tx = await contract.transfer(
          {
            target: toAddress.trim(),
            qty: quantity,
          },
          WRITE_OPTIONS,
        );
        eventEmitter.emit('success', {
          name: 'ARIO Transfer',
          message: `Transfer of ${new mARIOToken(quantity)
            .toARIO()
            .valueOf()} successful: ${tx.id}`,
        });
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
          <Panel header={<span>Transfer ARIO</span>} key="1">
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
                  [VALIDATION_INPUT_TYPES.AO_ADDRESS]: {
                    fn: async (id: string) => {
                      if (!isValidAoAddress(id)) {
                        throw new Error('Invalid address');
                      }
                    },
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
                Amount:{' '}
                {formatARIO(new mARIOToken(quantity).toARIO().valueOf())}
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
                placeholder={'Quantity in ARIO to send'}
                value={new mARIOToken(quantity).toARIO().valueOf()}
                setValue={(e) =>
                  setQuantity(
                    new ARIOToken(parseInt(e?.toString())).toMARIO().valueOf(),
                  )
                }
                validationPredicates={{}}
              />
              <span style={{ color: 'var(--accent)' }}>
                {loading
                  ? 'Loading balance...'
                  : `Balance: ${formatARIO(
                      Math.round(mioToIo(ioBalance)),
                    )} ${arioTicker}`}
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
