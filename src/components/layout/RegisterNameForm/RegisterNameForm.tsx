import { useEffect, useRef, useState } from 'react';

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { ArweaveTransactionID, VALIDATION_INPUT_TYPES } from '../../../types';
import Dropdown from '../../inputs/Dropdown/Dropdown';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import UpgradeTier from '../UpgradeTier/UpgradeTier';
import './styles.css';

function RegisterNameForm() {
  const isMobile = useIsMobile();
  const [{ domain, ttl, antID }, dispatchRegisterState] =
    useRegistrationState();
  const [{ arnsSourceContract, arweaveDataProvider }] = useGlobalState();

  const [isValidAnt, setIsValidAnt] = useState<boolean | undefined>(undefined);
  const [antTxID, setAntTXId] = useState<string | undefined>(antID?.toString());
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!antID) {
      reset();
      return;
    }
    if (inputRef.current) {
      inputRef.current.focus();
      handleAntId(antID.toString());
    }
  }, []);

  function reset() {
    setIsValidAnt(undefined);
    setAntTXId('');
    dispatchRegisterState({
      type: 'setAntID',
      payload: undefined,
    });
    dispatchRegisterState({
      type: 'setTTL',
      payload: 100,
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

      const { controller, name, owner, ticker, records } = state;
      dispatchRegisterState({
        type: 'setControllers',
        payload: [
          controller
            ? new ArweaveTransactionID(controller)
            : new ArweaveTransactionID(owner),
        ],
      });
      dispatchRegisterState({
        type: 'setNickname',
        payload: name,
      });
      dispatchRegisterState({
        type: 'setOwner',
        payload: new ArweaveTransactionID(owner),
      });
      dispatchRegisterState({
        type: 'setTicker',
        payload: ticker,
      });
      // legacy targetID condition
      if (records['@']) {
        if (records['@'].transactionId) {
          dispatchRegisterState({
            type: 'setTargetID',
            payload: new ArweaveTransactionID(records['@'].transactionId),
          });
        }
        if (!records['@'].transactionId)
          dispatchRegisterState({
            type: 'setTargetID',
            payload: new ArweaveTransactionID(records['@']),
          });
      }

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
        <div className="register-inputs center">
          <div className="input-group center column">
            <ValidationInput
              value={antTxID ?? ''}
              setValue={(e: string) => handleAntId(e)}
              setIsValid={(isValid: boolean) => setIsValidAnt(isValid)}
              wrapperClassName={'flex flex-column center'}
              wrapperCustomStyle={{ gap: '0.5em', position: 'relative' }}
              validationListStyle={{
                gap: isMobile ? '0.5em' : '1em',
                position: !isMobile ? 'absolute' : 'unset',
                left: !isMobile ? '103%' : 'unset',
                paddingTop: !isMobile ? '7%' : 'unset',
              }}
              inputClassName={'data-input center'}
              inputCustomStyle={
                isValidAnt && antTxID
                  ? { border: 'solid 2px var(--success-green)' }
                  : !isValidAnt && antTxID
                  ? { border: 'solid 2px var(--error-red)' }
                  : {}
              }
              placeholder={'Enter an ANT Contract ID Validation Input'}
              showValidationChecklist={true}
              validationPredicates={{
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
