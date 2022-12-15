import { useState } from 'react';

import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { ArweaveTransactionId } from '../../../types';
import {
  isArNSDomainNameValid,
  isArweaveTransactionID,
} from '../../../utils/searchUtils';
import Dropdown from '../../inputs/Dropdown/Dropdown';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import UpgradeTier from '../UpgradeTier/UpgradeTier';
import './styles.css';

function RegisterNameForm() {
  const [antFlow, setAntFlow] = useState(
    'Create an Arweave Name Token (ANT) for me',
  );
  const [antAddress, setAntAddress] = useState<ArweaveTransactionId>();
  const [{ domain, ttl, targetID }, dispatchRegisterState] =
    useRegistrationState();

  function handleTargetID(e: any) {
    const id = e.target.value.trim();
    // todo: add some more advanced error handling and notifications to check if id is a dataID or a value transfer
    dispatchRegisterState({
      type: 'setTargetID',
      payload: id,
    });
    return;
  }

  return (
    <>
      <div className="register-name-modal center">
        <div className="section-header">{domain} is available!</div>
        <div className="section-header">Register Domain</div>
        <div className="register-inputs center">
          <div className="input-group center column">
            <Dropdown
              showSelected={true}
              showChevron={true}
              selected={antFlow}
              setSelected={setAntFlow}
              options={{
                create: 'Create an Arweave Name Token (ANT) for me',
                useExisting: 'I have an Arweave Name Token (ANT) I want to use',
              }}
            />
            {/**TODO: add global error state to mark issues with the target id */}
            {antFlow === 'Create an Arweave Name Token (ANT) for me' ? (
              <input
                className="data-input center"
                placeholder="Target ID"
                value={targetID}
                onChange={(e) => handleTargetID(e)}
                maxLength={43}
                style={
                  targetID && isArweaveTransactionID(targetID)
                    ? { border: '2px solid var(--success-green)' }
                    : targetID && !isArweaveTransactionID(targetID)
                    ? { border: '2px solid var(--error-red)' }
                    : {}
                }
              />
            ) : antFlow ===
              'I have an Arweave Name Token (ANT) I want to use' ? (
              <Dropdown
                showChevron={true}
                showSelected={false}
                options={{
                  1: 'ant one',
                  2: 'ant two',
                  3: 'ant three',
                  4: 'ant four',
                }}
                selected={antAddress}
                setSelected={setAntAddress}
                headerElement={<></>}
                footerElement={
                  <div
                    className="data-input last-dropdown-option center"
                    style={{ background: 'var(--bg-color)' }}
                  >
                    <span className="text bold white center">
                      See All Tokens
                    </span>
                  </div>
                }
              />
            ) : (
              <></>
            )}
          </div>
          {/**add a tag component for multiple controllers seperated by "," commas. In the future might have an address book. Possibly suggest other accounts from arconnect. */}
          <input
            className="data-input center"
            type="text"
            placeholder="Controllers"
            onChange={(e) => handleTargetID(e.target.value)}
            maxLength={43}
          />
          <div className="input-group center">
            <input
              className="data-input center"
              type="text"
              placeholder="Nickname*"
            />
            <input
              className="data-input center"
              type="text"
              placeholder="Ticker*"
            />
            <Dropdown
              showSelected={true}
              showChevron={true}
              selected={`${ttl}secs`}
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
