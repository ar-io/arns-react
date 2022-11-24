import Dropdown from '../../inputs/Dropdown/Dropdown';
import UpgradeTier from '../../layout/UpgradeTier/UpgradeTier';
import './styles.css';

function RegisterNameModal() {
  return (
    <div className="registerNameModal center">
      <div className="sectionHeader">sam.arweave.dev is available!</div>

      <div className="sectionHeader">Register Domain</div>

      <div className="registerInputs center">
        <div className="inputGroup center column">
          <Dropdown
            options={[
              'Create an Arweave Name Token (ANT) for me',
              'I have an Arweave Name Token (ANT) I want to use',
            ]}
          />
          <input
            className="dataInput center"
            type="text"
            placeholder="Enter your ANT Contract ID"
          />
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
          <Dropdown options={['700ms', '800ms', '900ms', '1000ms']} />
        </div>
      </div>

      <UpgradeTier />
    </div>
  );
}

export default RegisterNameModal;
