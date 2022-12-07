import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { ArnsCard } from '../../cards';
import './styles.css';

function SuccessfulRegistration() {
  const [{ arnsSourceContract, walletAddress }] = useGlobalState();
  const [{ domain }] = useRegistrationState();
  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex-column center" style={{ gap: '2em' }}>
        <span className="textLarge white center">Success!</span>

        <div className="flex-column center" style={{ gap: '.5em' }}>
          <span
            className="text white center"
            style={!isMobile ? { maxWidth: 'none' } : {}}
          >
            Transaction ID:&nbsp;
            <button className="link">
              <b>
                {!isMobile
                  ? walletAddress
                  : `${walletAddress?.slice(0, 5)} . . . ${walletAddress?.slice(
                      -5,
                    )}`}
              </b>
            </button>
          </span>
          <span className="text faded center">
            Will take at least 15 minutes for your transaction to be posted.
          </span>
        </div>

        <ArnsCard domain={domain} id={arnsSourceContract.records[domain]} />
        <span>
          <button className="link center">Manage Names</button>
        </span>
      </div>
    </>
  );
}

export default SuccessfulRegistration;
