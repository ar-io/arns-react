import { Link } from 'react-router-dom';

import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { PdnsCard } from '../../cards';
import './styles.css';

function SuccessfulRegistration() {
  const [{ domain, resolvedTxID }] = useRegistrationState();

  return (
    <>
      <div className="flex-column center" style={{ gap: '3em' }}>
        <span className="text-large white center">
          <b>{domain}</b>.arweave.net is yours!
        </span>

        <div className="flex-column center" style={{ gap: '1em' }}>
          <span className="flex text white center">Transaction ID:</span>
          <span className="flex text white center">
            <a
              className="flex center link"
              style={{
                wordBreak: 'break-word',
              }}
              target="_blank"
              href={`https://sonar.warp.cc/#/app/interaction/${resolvedTxID?.toString()}`}
              rel="noreferrer"
            >
              <b className="center">{resolvedTxID?.toString()}</b>
            </a>
          </span>
          <span className="flex text faded center">
            It will take at least 15 minutes for gateways to resolve this new
            Pdns domain name.
          </span>
        </div>

        {domain ? (
          <>
            <PdnsCard domain={domain} id={resolvedTxID!} />
            <span>
              <Link
                to={'/manage'}
                className="accent-button hover"
                style={{ textDecoration: 'none' }}
              >
                Manage Names
              </Link>
            </span>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default SuccessfulRegistration;
