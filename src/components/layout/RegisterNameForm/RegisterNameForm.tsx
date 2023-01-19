import { useEffect, useRef, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { ArweaveTransactionId } from '../../../types';
import { isArweaveTransactionID } from '../../../utils/searchUtils';
import Dropdown from '../../inputs/Dropdown/Dropdown';
import Loader from '../Loader/Loader';
import UpgradeTier from '../UpgradeTier/UpgradeTier';
import './styles.css';

function RegisterNameForm() {
  const [{ domain, ttl, antID }, dispatchRegisterState] =
    useRegistrationState();
  const [{ arnsSourceContract, arweaveDataProvider }] = useGlobalState();

  const [isValidAnt, setIsValidAnt] = useState<boolean | undefined>(undefined);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [antTxID, setAntTXId] = useState(antID);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!antID) {
      reset();
    }
    if (inputRef.current) {
      inputRef.current.focus();
      handleAntId(antID);
    }
  }, []);

  function reset() {
    setIsValidAnt(undefined);
    setIsValidating(false);
    setValidationErrors([]);
    dispatchRegisterState({
      type: 'setAntID',
      payload: undefined,
    });
    dispatchRegisterState({
      type: 'setTTL',
      payload: 100,
    });
  }

  async function handleAntId(id?: ArweaveTransactionId) {
    setIsValidating(true);
    setAntTXId(id);
    setValidationErrors([]);
    if (!id || !id.length) {
      reset();
      return;
    }

    try {
      await arweaveDataProvider.validateTransactionTags({
        id,
        requiredTags: {
          'Contract-Src': arnsSourceContract.approvedANTSourceCodeTxs,
        },
      });
      const state = await arweaveDataProvider.getContractState(id);
      if (state == undefined) {
        throw Error('ANT contract state is undefined');
      }

      const { controller, name, owner, ticker, records } = state;
      dispatchRegisterState({
        type: 'setAntID',
        payload: id,
      });
      dispatchRegisterState({
        type: 'setControllers',
        payload: [controller],
      });
      dispatchRegisterState({
        type: 'setNickname',
        payload: name,
      });
      dispatchRegisterState({
        type: 'setOwner',
        payload: owner,
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
            payload: records['@'].transactionId,
          });
        }
        if (!records['@'].transactionId && isArweaveTransactionID(records['@']))
          dispatchRegisterState({
            type: 'setTargetID',
            payload: records['@'],
          });
      }

      setIsValidAnt(true);
    } catch (error: any) {
      dispatchRegisterState({
        type: 'setAntID',
        payload: undefined,
      });
      setIsValidAnt(false);
      setValidationErrors([error.message]);
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <>
      <div className="register-name-modal center">
        <span className="text-large white">
          {domain}.arweave.net is available!
        </span>
        <div className="section-header">Register Domain</div>
        <div className="register-inputs center">
          <div className="input-group center column">
            <div className="flex-row center tool-tip">
              <input
                className="data-input center"
                type="text"
                placeholder="Enter an ANT Contract ID"
                onChange={(e) => handleAntId(e.target.value)}
                maxLength={43}
                value={antTxID ?? ''}
                ref={inputRef}
                style={
                  isValidAnt && antTxID
                    ? { border: 'solid 2px var(--success-green)' }
                    : !isValidAnt && antTxID && !isValidating
                    ? { border: 'solid 2px var(--error-red)' }
                    : {}
                }
              />
              <div className={'validation-spinner'}>
                {isValidating ? <Loader size={25} color={'black'} /> : <></>}
              </div>
            </div>
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
        <div className="flex-column center">
          {validationErrors.map((e: string) => (
            <span key={e} className="text error">
              {e}
            </span>
          ))}
        </div>
        <UpgradeTier />
      </div>
    </>
  );
}

export default RegisterNameForm;
