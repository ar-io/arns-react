import { useState } from 'react';

import {
  isArNSDomainNameAvailable,
  isArNSDomainNameValid,
} from '../../../utils/searchUtils';
import Dropdown from '../../inputs/Dropdown/Dropdown';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import UpgradeTier from '../../layout/UpgradeTier/UpgradeTier';
import './styles.css';

function RegisterNameModal() {
  const [antFlow, setAntFlow] = useState(0);
  const [TTL, setTTL] = useState(0);
  const [antAddress, setAntAddress] = useState(0);

  return (
    <div className="registerNameModal center">
      <div className="sectionHeader">sam.arweave.dev is available!</div>

      <div className="sectionHeader">Register Domain</div>

      <div className="registerInputs center">
        <div className="inputGroup center column">
          <Dropdown
            showSelected={true}
            showChevron={true}
            selected={antFlow}
            setSelected={setAntFlow}
            options={[
              'Create an Arweave Name Token (ANT) for me',
              'I have an Arweave Name Token (ANT) I want to use',
            ]}
          />
          {antFlow === 0 ? (
            <span
              className="dataInput center"
              style={{ color: 'var(--placeholder-text)' }}
            >
              ANT Contract ID
            </span>
          ) : antFlow === 1 ? (
            <Dropdown
              showChevron={true}
              showSelected={true}
              options={['ant one', 'ant two', 'ant one', 'ant two']}
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
                />
              }
              footerElement={
                <div
                  className="dataInput lastDropdownOption center"
                  style={{ background: 'var(--bg-color)' }}
                >
                  <span className="text bold white center">See All Tokens</span>
                </div>
              }
            />
          ) : (
            <></>
          )}
        </div>

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
          <input
            className="dataInput center"
            type="text"
            placeholder="Controller"
          />
          <Dropdown
            showSelected={true}
            showChevron={true}
            selected={TTL}
            setSelected={setTTL}
            options={['700ms', '800ms', '900ms', '1000ms']}
          />
        </div>
      </div>

      <UpgradeTier />
    </div>
  );
}

export default RegisterNameModal;
