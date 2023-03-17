import { useEffect, useRef, useState } from 'react';

import { useIsMobile } from '../../../hooks';
import { ANTContract } from '../../../services/arweave/AntContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import {
  ANTContractJSON,
  ArweaveTransactionID,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import Dropdown from '../../inputs/Dropdown/Dropdown';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import UpgradeTier from '../UpgradeTier/UpgradeTier';
import './styles.css';

function RegisterNameForm() {
  const isMobile = useIsMobile();
  const [{ domain, antID, antContract }, dispatchRegisterState] =
    useRegistrationState();
  const [{ arnsSourceContract, arweaveDataProvider }] = useGlobalState();

  const [isValidAnt, setIsValidAnt] = useState<boolean | undefined>(undefined);
  enum REGISTRATION_TYPES {
    CREATE = 'Create an Arweave Name Token (ANT) for me',
    USE_EXISTING = 'Use existing Arweave Name Token (ANT)',
  }
  const registrationOptions = {
    create: [REGISTRATION_TYPES.CREATE],
    'use-existing': [REGISTRATION_TYPES.USE_EXISTING],
  };
  const [registrationType, setRegistrationType] = useState(
    REGISTRATION_TYPES.CREATE,
  );
  const [antTxID, setAntTXId] = useState<string | undefined>(antID?.toString());
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!antID) {
      reset();
      return;
    }
    if (inputRef.current) {
      inputRef.current.focus();
      handleAntId(...antID.toString());
    }
  }, []);
  useEffect(() => {
    if (!antID) {
      return;
    }
    handleAntId(antID.toString());
  }, [registrationType]);

  function reset() {
    setIsValidAnt(undefined);
    setAntTXId('');
    dispatchRegisterState({
      type: 'setAntID',
      payload: undefined,
    });
  }

  async function handleAntId(id?: string) {
    if (!id || !id.length) {
      reset();
      return;
    }
    if (id && id.length < 44) {
      setAntTXId(id);
    }

    try {
      const txId = new ArweaveTransactionID(id);
      dispatchRegisterState({
        type: 'setAntID',
        payload: txId,
      });

      const state = await arweaveDataProvider.getContractState(txId);
      if (state == undefined) {
        throw Error('ANT contract state is undefined');
      }

      dispatchRegisterState({
        type: 'setAntContract',
        payload: new ANTContract(state),
      });

      setIsValidAnt(true);
    } catch (error: any) {
      dispatchRegisterState({
        type: 'setAntID',
        payload: undefined,
      });
      console.error(error);
    }
  }

  return (
    <>
      <div className="register-name-modal">
        <span className="text-large white center">
          {domain}.arweave.net is available!
        </span>
        <div className="section-header">Register Domain</div>
        <div className="register-inputs center" style={{ gap: '0' }}>
          <div className="input-group center column">
            <Dropdown
              showSelected={true}
              showChevron={true}
              options={registrationOptions}
              selected={registrationType}
              setSelected={(selection) => setRegistrationType(selection)}
            />

            <ValidationInput
              value={antTxID ?? ''}
              setValue={(e: string) => handleAntId(e)}
              validityCallback={(isValid: boolean) => setIsValidAnt(isValid)}
              wrapperClassName={'flex flex-column center'}
              wrapperCustomStyle={{ gap: '0.5em', boxSizing: 'border-box' }}
              showValidationIcon={true}
              inputClassName={'data-input center'}
              inputCustomStyle={
                isValidAnt && antTxID
                  ? { border: 'solid 2px var(--success-green)', width: '100%' }
                  : !isValidAnt && antTxID
                  ? { border: 'solid 2px var(--error-red)', width: '100%' }
                  : {}
              }
              placeholder={
                registrationType == REGISTRATION_TYPES.USE_EXISTING
                  ? 'Enter a Contract ID, nickname, or ticker'
                  : 'Enter a Target ID'
              }
              showValidationChecklist={true}
              validationPredicates={
                registrationType == REGISTRATION_TYPES.USE_EXISTING
                  ? {
                      [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: (id: string) =>
                        arweaveDataProvider.validateArweaveId(id),
                      [VALIDATION_INPUT_TYPES.ANT_CONTRACT_ID]: (id: string) =>
                        arweaveDataProvider.validateTransactionTags({
                          id,
                          requiredTags: {
                            'Contract-Src':
                              arnsSourceContract.approvedANTSourceCodeTxs,
                          },
                        }),
                      [VALIDATION_INPUT_TYPES.TRANSACTION_CONFIRMATIONS]: (
                        id: string,
                      ) => arweaveDataProvider.validateConfirmations(id),
                    }
                  : {
                      [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: (id: string) =>
                        arweaveDataProvider.validateArweaveId(id),
                    }
              }
              maxLength={43}
            />
          </div>
          <div className="input-group center">
            <input className="data-input center" />
            <input className="data-input center" />
            <input className="data-input center" />
            <Dropdown
              showSelected={true}
              showChevron={true}
              selected={`${antContract?.records['@'].ttlSeconds} seconds`}
              setSelected={(value) =>
                antContract
                  ? (antContract.records = { '@': { ttlSeconds: value } })
                  : undefined
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
