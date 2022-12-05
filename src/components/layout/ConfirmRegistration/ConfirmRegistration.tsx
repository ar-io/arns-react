import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { AntCard } from '../../cards';
import './styles.css';

function ConfirmRegistration() {
  const [{ domain }] = useRegistrationState();

  return (
    <>
      <div className="registerNameModal">
        <AntCard domain={domain} id={domain} />
      </div>
    </>
  );
}

export default ConfirmRegistration;
