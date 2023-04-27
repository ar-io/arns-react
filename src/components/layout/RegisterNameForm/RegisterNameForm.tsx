import { useEffect, useRef, useState } from 'react';

import { useArweaveCompositeProvider } from '../../../hooks';
import { PDNTContract } from '../../../services/arweave/PDNTContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import Dropdown from '../../inputs/Dropdown/Dropdown';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import UpgradeTier from '../UpgradeTier/UpgradeTier';
import './styles.css';

function RegisterNameForm() {
  const [{ domain, ttl, pdntID }, dispatchRegisterState] =
    useRegistrationState();
  const [{ pdnsSourceContract }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();

  const [isValidPDNT, setIsValidPDNT] = useState<boolean | undefined>(
    undefined,
  );
  const [pdntTxID, setPDNTTXId] = useState<string | undefined>(
    pdntID?.toString(),
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!pdntID) {
      reset();
      return;
    }
    if (inputRef.current) {
      inputRef.current.focus();
      handlePDNTId(pdntID.toString());
    }
  }, []);

  function reset() {
    setIsValidPDNT(undefined);
    setPDNTTXId('');
    dispatchRegisterState({
      type: 'setPDNTID',
      payload: undefined,
    });
    dispatchRegisterState({
      type: 'setTTL',
      payload: 100,
    });
  }

  async function handlePDNTId(id?: string) {
    if (!id || !id.length) {
      reset();
      return;
    }
    if (id && id.length < 44) {
      setPDNTTXId(id);
    }

    try {
      const txId = new ArweaveTransactionID(id);
      dispatchRegisterState({
        type: 'setPDNTID',
        payload: txId,
      });

      const state =
        await arweaveDataProvider.getContractState<PDNTContractJSON>(txId);
      if (state == undefined) {
        throw Error('PDNT contract state is undefined');
      }

      const pdnt = new PDNTContract(state);
      dispatchRegisterState({
        type: 'setControllers',
        payload: [
          pdnt.controller
            ? new ArweaveTransactionID(pdnt.controller)
            : new ArweaveTransactionID(pdnt.owner),
        ],
      });
      // update to use PDNTContract
      dispatchRegisterState({
        type: 'setNickname',
        payload: pdnt.name,
      });
      dispatchRegisterState({
        type: 'setOwner',
        payload: new ArweaveTransactionID(pdnt.owner),
      });
      dispatchRegisterState({
        type: 'setTicker',
        payload: pdnt.ticker,
      });
      // legacy targetID condition

      dispatchRegisterState({
        type: 'setTargetID',
        payload: new ArweaveTransactionID(pdnt.getRecord('@').transactionId),
      });

      setIsValidPDNT(true);
    } catch (error: any) {
      dispatchRegisterState({
        type: 'setPDNTID',
        payload: undefined,
      });
      // don't emit here, since we have the validation
    }
  }

  return (
    <>
      <div className="register-name-modal">
        <span className="text-large white center">
          {domain}.arweave.net is available!
        </span>
        <div className="section-header">Register Domain</div>
        <div className="register-inputs center">
          <div className="input-group center column">
            <ValidationInput
              value={pdntTxID ?? ''}
              setValue={(e: string) => handlePDNTId(e)}
              validityCallback={(isValid: boolean) => setIsValidPDNT(isValid)}
              wrapperClassName={'flex flex-column center'}
              wrapperCustomStyle={{ gap: '0.5em', boxSizing: 'border-box' }}
              showValidationIcon={true}
              inputClassName={'data-input center'}
              inputCustomStyle={
                isValidPDNT && pdntTxID
                  ? { border: 'solid 2px var(--success-green)', width: '100%' }
                  : !isValidPDNT && pdntTxID
                  ? { border: 'solid 2px var(--error-red)', width: '100%' }
                  : {}
              }
              placeholder={'Enter an PDNT Contract ID Validation Input'}
              validationPredicates={{
                [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: (id: string) =>
                  arweaveDataProvider.validateArweaveId(id),
                [VALIDATION_INPUT_TYPES.PDNT_CONTRACT_ID]: (id: string) =>
                  arweaveDataProvider.validateTransactionTags({
                    id,
                    requiredTags: {
                      'Contract-Src':
                        pdnsSourceContract.approvedANTSourceCodeTxs,
                    },
                  }),
                [VALIDATION_INPUT_TYPES.TRANSACTION_CONFIRMATIONS]: (
                  id: string,
                ) => arweaveDataProvider.validateConfirmations(id),
              }}
              maxLength={43}
            />
          </div>
          <div className="input-group center">
            <Dropdown
              showSelected={true}
              showChevron={true}
              selected={`${ttl} seconds`}
              setSelected={(value) =>
                dispatchRegisterState({ type: 'setTTL', payload: value })
              }
              options={{
                '100secs': 100,
                '200secs': 200,
                '300secs': 300,
                '400secs': 400,
                '500secs': 500,
                '600secs': 600,
                '700secs': 700,
                '800secs': 800,
              }}
            />
          </div>
        </div>
        <UpgradeTier />
      </div>
    </>
  );
}

export default RegisterNameForm;
