import { Link } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { ArnsCard } from '../../cards';
import './styles.css';

function SuccessfulRegistration() {
  const [{ domain, resolvedTxID }] = useRegistrationState();
  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex-column center" style={{ gap: '2em' }}>
        <span className="text-large white center">Success!</span>

        <div className="flex-column center" style={{ gap: '.5em' }}>
          <span
            className="text white center"
            style={!isMobile ? { maxWidth: 'none' } : {}}
          >
            Transaction ID:&nbsp;
            <a
              className="link"
              href={`https://viewblock.io/arwweave/tx/${resolvedTxID}`}
            >
              <b>{resolvedTxID}</b>
            </a>
          </span>
          <span className="text faded center">
            It will take at least 15 minutes for your transaction to be posted.
          </span>
        </div>

        <ArnsCard domain={domain} id={resolvedTxID!} />
        <span>
          <Link
            to={'/manage'}
            className="accent-button hover"
            style={{ textDecoration: 'none' }}
          >
            Manage Names
          </Link>
        </span>
      </div>
    </>
  );
}

export default SuccessfulRegistration;
