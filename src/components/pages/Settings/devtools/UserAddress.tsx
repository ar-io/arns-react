import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useWalletState } from '@src/state/contexts/WalletState';
import { AoAddress, VALIDATION_INPUT_TYPES } from '@src/types';
import { isArweaveTransactionID, isValidAoAddress } from '@src/utils';
import { useState } from 'react';

import ValidationInput from '../../../inputs/text/ValidationInput/ValidationInput';

const inputClass =
  'bg-foreground justify-center items-center outline-none w-full';

const inputContainerClass =
  'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';

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
    <div className="flex flex-col w-full h-fit p-3 text-sm">
      <div className={inputContainerClass}>
        <span className="text-white text-md w-1/3">Current Address:</span>
        <ValidationInput
          placeholder="Enter custom wallet address"
          inputClassName={inputClass}
          inputCustomStyle={{
            paddingLeft: '10px',
            fontSize: '16px',
            background: 'var(--card-bg)',
            borderRadius: 'var(--corner-radius)',
            border: '1px solid var(--text-faded)',
            padding: '15px',
            color: 'white',
          }}
          wrapperCustomStyle={{
            position: 'relative',
            border: 'none',
            borderRadius: 'var(--corner-radius)',
          }}
          showValidationIcon={false}
          showValidationOutline={false}
          showValidationChecklist={false}
          validationListStyle={{ display: 'none' }}
          maxCharLength={43}
          value={newUserAddress}
          setValue={setNewWalletAddress}
          validityCallback={(validity: boolean) => setIsValidAddress(validity)}
          validationPredicates={{
            [VALIDATION_INPUT_TYPES.AO_ADDRESS]: {
              fn: async (id: string) => {
                if (!isValidAoAddress(id)) throw new Error('not a valid id');
              },
              required: false,
            },
          }}
        />
        {isValidAddress === false ? (
          <span className="text-color-error mb-2">Invalid address</span>
        ) : (
          <></>
        )}
        <div className="flex flex-row gap-2 mt-2">
          <button
            className="bg-background hover:bg-light-grey border border-white shadow-md text-white py-2 px-4  rounded-md text-md"
            onClick={() => confirmSetting(newUserAddress.trim())}
          >
            Set User Address
          </button>
          <button
            className="bg-background hover:bg-light-grey border border-white shadow-md text-white py-2 px-4  rounded-md text-md"
            onClick={reset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserAddress;
