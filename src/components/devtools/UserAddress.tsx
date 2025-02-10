import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useWalletState } from '@src/state/contexts/WalletState';
import { AoAddress, VALIDATION_INPUT_TYPES } from '@src/types';
import { isArweaveTransactionID, isValidAoAddress } from '@src/utils';
import { Collapse, Space } from 'antd';
import { useState } from 'react';

import ValidationInput from '../inputs/text/ValidationInput/ValidationInput';
import ArweaveID, { ArweaveIdTypes } from '../layout/ArweaveID/ArweaveID';
import './styles.css';

const Panel = Collapse.Panel;

function UserAddress() {
  const [{ wallet, walletAddress }, dispatchWalletState] = useWalletState();
  const [newUserAddress, setNewWalletAddress] = useState<string>(
    walletAddress?.toString() ?? '',
  );
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  function confirmSetting(id: string) {
    if (isValidAoAddress(id)) {
      dispatchWalletState({
        type: 'setWalletAddress',
        payload: isArweaveTransactionID(id)
          ? new ArweaveTransactionID(id)
          : (id as AoAddress),
      });
    }
  }

  async function reset() {
    setNewWalletAddress('');
    setIsValidAddress(undefined);
    if (wallet) {
      const address = await wallet.getWalletAddress();
      dispatchWalletState({
        type: 'setWalletAddress',
        payload: address,
      });
    } else {
      dispatchWalletState({
        type: 'setWalletAddress',
        payload: undefined,
      });
    }
  }

  return (
    <div className="flex" style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Collapse style={{ width: '100%' }} prefixCls="ario-collapse">
          <Panel
            header={
              <div className="flex" style={{ justifyContent: 'space-between' }}>
                <span>User Settings</span>
              </div>
            }
            key="1"
          >
            <>
              <div className="flex" style={{ gap: '4px' }}>
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
              <span className="grey text-medium whitespace-nowrap">
                Wallet Address:{' '}
                {walletAddress && (
                  <ArweaveID
                    id={walletAddress}
                    characterCount={20}
                    shouldLink
                    type={ArweaveIdTypes.ADDRESS}
                  />
                )}
              </span>
              <ValidationInput
                placeholder="Enter custom wallet address"
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
                value={newUserAddress}
                setValue={setNewWalletAddress}
                validityCallback={(validity: boolean) =>
                  setIsValidAddress(validity)
                }
                validationPredicates={{
                  [VALIDATION_INPUT_TYPES.AO_ADDRESS]: {
                    fn: async (id: string) => {
                      if (!isValidAoAddress(id))
                        throw new Error('not a valid id');
                    },
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
                onClick={() => confirmSetting(newUserAddress.trim())}
              >
                Set User Address
              </button>
            </>
          </Panel>
        </Collapse>
      </Space>
    </div>
  );
}

export default UserAddress;
