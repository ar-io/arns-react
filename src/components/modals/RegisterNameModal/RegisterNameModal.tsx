import { useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import {
  isArNSDomainNameAvailable,
  isArNSDomainNameValid,
  isArweaveTransactionID,
} from '../../../utils/searchUtils';
import Dropdown from '../../inputs/Dropdown/Dropdown';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import UpgradeTier from '../../layout/UpgradeTier/UpgradeTier';
import './styles.css';

function RegisterNameModal() {
  const [antFlow, setAntFlow] = useState(
    'Create an Arweave Name Token (ANT) for me',
  );
  const [antAddress, setAntAddress] = useState(0);
  const [
    {
      fee,
      leaseDuration,
      chosenTier,
      domain,
      ttl,
      targetID,
      antID,
      stage,
      isFirstStage,
      isLastStage,
    },
    dispatchRegisterState,
  ] = useRegistrationState();

  function updateRegisterState({ key, value }: { key: any; value: any }) {
    setTimeout(
      () =>
        dispatchRegisterState({
          type: key,
          payload: value,
        }),
      50,
    );
  }

  function handleTargetID(id: string) {
    // todo: add some more advanced error handling and notifications to check if id is a dataID or a value transfer
    if (isArweaveTransactionID(id)) {
      updateRegisterState({ key: 'setTargetID', value: id });
    }
    if (!id) {
      updateRegisterState({ key: 'setTargetID', value: undefined });
    }
    if (!isArweaveTransactionID(id)) {
      updateRegisterState({ key: 'setTargetID', value: undefined });
    }
  }

  return (
    <>
      <div className="registerNameModal center">
        <div className="sectionHeader">{domain} is available!</div>

        <div className="sectionHeader">Register Domain</div>

        <div className="registerInputs center">
          <div className="inputGroup center column">
            <Dropdown
              showSelected={true}
              showChevron={true}
              selected={antFlow}
              setSelected={setAntFlow}
              options={{
                'Create an Arweave Name Token (ANT) for me':
                  'Create an Arweave Name Token (ANT) for me',
                'I have an Arweave Name Token (ANT) I want to use':
                  'I have an Arweave Name Token (ANT) I want to use',
              }}
            />
            {/**TODO: add global error state to mark issues with the target id */}
            {antFlow === 'Create an Arweave Name Token (ANT) for me' ? (
              <input
                className="dataInput center"
                placeholder="Target ID"
                onChange={(e) => handleTargetID(e.target.value)}
                maxLength={43}
                style={
                  targetID && isArweaveTransactionID(targetID)
                    ? { border: '4px solid var(--success-green)' }
                    : targetID && isArweaveTransactionID(targetID)
                    ? { border: '4px solid var(--error-red)' }
                    : {}
                }
              />
            ) : antFlow ===
              'I have an Arweave Name Token (ANT) I want to use' ? (
              <Dropdown
                showChevron={true}
                showSelected={false}
                options={['ant one', 'ant two', 'ant three', 'ant four']}
                selected={antAddress}
                setSelected={setAntAddress}
                headerElement={
                  <SearchBar
                    validationPredicate={(name) =>
                      isArNSDomainNameValid({ name })
                    }
                    successPredicate={(name) => {
                      return true;
                    }}
                    placeholderText="Enter ANT Contract ID"
                    height={30}
                  />
                }
                footerElement={
                  <div
                    className="dataInput lastDropdownOption center"
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
            className="dataInput center"
            type="text"
            placeholder="Controllers"
            onChange={(e) => handleTargetID(e.target.value)}
            maxLength={43}
          />
          <div className="inputGroup center">
            <input
              className="dataInput center"
              type="text"
              placeholder="Nickname*"
            />
            <input
              className="dataInput center"
              type="text"
              placeholder="Ticker*"
            />

            <Dropdown
              showSelected={true}
              showChevron={true}
              selected={ttl}
              setSelected={(value) =>
                updateRegisterState({ key: 'setTTL', value })
              }
              options={{
                '100s': 100,
                '200s': 200,
                '300s': 300,
                '400s': 400,
                '500s': 500,
                '600s': 600,
                '700s': 700,
                '800s': 800,
              }}
            />
          </div>
        </div>

        <UpgradeTier />
      </div>
    </>
  );
}

export default RegisterNameModal;
