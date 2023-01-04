import { useEffect, useState } from 'react';

import { defaultDataProvider } from '../../../services/arweave';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import {
  ARNS_TX_ID_ENTRY_REGEX,
  ARNS_TX_ID_REGEX,
} from '../../../utils/constants';
import { isArweaveTransactionID } from '../../../utils/searchUtils';
import Dropdown from '../../inputs/Dropdown/Dropdown';
import Loader from '../Loader/Loader';
import UpgradeTier from '../UpgradeTier/UpgradeTier';
import './styles.css';

function RegisterNameForm() {
  const [{ domain, ttl, antID }, dispatchRegisterState] =
    useRegistrationState();

  const [isValidAnt, setIsValidAnt] = useState<boolean | undefined>(undefined);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    reset();
  }, []);

  function reset() {
    setIsValidAnt(undefined);
    setIsValidating(false);
    dispatchRegisterState({
      type: 'setAntID',
      payload: undefined,
    });
    dispatchRegisterState({
      type: 'setTTL',
      payload: 100,
    });
  }

  async function handleAntId(e: any) {
    e.preventDefault();
    setIsValidating(true);
    const id = e.target.value.trim();
    if (!id || !id.length) {
      reset();
      return;
    }

    try {
      // if its a partial id set state and return
      if (ARNS_TX_ID_ENTRY_REGEX.test(id) && !ARNS_TX_ID_REGEX.test(id)) {
        setIsValidAnt(undefined);
        dispatchRegisterState({
          type: 'setAntID',
          payload: id,
        });
        setIsValidating(false);
        return;
      }
      dispatchRegisterState({
        type: 'setAntID',
        payload: id,
      });

      const dataProvider = defaultDataProvider();
      const state = await dataProvider.getContractState(id);
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
      setIsValidating(false);

      return;
    } catch (error) {
      console.error(error);
      setIsValidAnt(false);
      setIsValidating(false);
      return;
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
                placeholder="Enter an ANT ID"
                onChange={(e) => {
                  handleAntId(e);
                }}
                maxLength={43}
                style={
                  isValidAnt && antID
                    ? { border: 'solid 2px var(--success-green)' }
                    : !isValidAnt && antID
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
        <UpgradeTier />
      </div>
    </>
  );
}

export default RegisterNameForm;
