import { ARIOToken, AoARIOWrite, mARIOToken } from '@ar.io/sdk/web';
import { useArIOLiquidBalance } from '@src/hooks/useArIOBalance';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { VALIDATION_INPUT_TYPES } from '@src/types';
import { formatARIO, isValidAoAddress, mioToIo } from '@src/utils';
import { WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { useState } from 'react';

import ValidationInput from '../../../inputs/text/ValidationInput/ValidationInput';

const inputClass =
  'bg-foreground justify-center items-center outline-none w-full';
const inputContainerClass =
  'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';

function TransferIO() {
  const [{ arioContract, arioTicker }] = useGlobalState();
  const [toAddress, setToAddress] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  const [quantity, setQuantity] = useState<number>(0);
  const [transferring, setTransferring] = useState<boolean>(false);
  const { data: ioBalance } = useArIOLiquidBalance();

  async function confirmTransfer() {
    try {
      setTransferring(true);
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
      setTransferring(false);
    }
  }

  return (
    <div className="flex flex-col w-full h-fit p-3 text-sm">
      <div className={inputContainerClass}>
        <span className="text-white text-md">
          Transfer ${arioTicker} (
          {formatARIO(Math.round(mioToIo(ioBalance ?? 0)))} ${arioTicker})
        </span>
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-white text-md">Recipient Address:</span>
          <ValidationInput
            placeholder="Enter recipient wallet address"
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
            <span className="text-color-error" style={{ marginBottom: '10px' }}>
              invalid address
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-white text-md">Amount:</span>
          <ValidationInput
            catchInvalidInput={true}
            inputClassName={inputClass}
            inputType="number"
            inputCustomStyle={{
              background: 'var(--card-bg)',
              borderRadius: 'var(--corner-radius)',
              border: '1px solid var(--text-faded)',
              padding: '15px',
              color: 'white',
            }}
            placeholder={`Quantity in ${arioTicker} to send`}
            value={new mARIOToken(quantity).toARIO().valueOf()}
            setValue={(e) =>
              setQuantity(
                new ARIOToken(parseInt(e?.toString())).toMARIO().valueOf(),
              )
            }
            validationPredicates={{}}
          />
        </div>
        <div className="flex flex-row w-full justify-end">
          <button
            className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-full flex w-fit py-1 px-3 rounded-sm text-md font-semibold"
            onClick={confirmTransfer}
            disabled={transferring || !isValidAddress || !quantity}
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransferIO;
