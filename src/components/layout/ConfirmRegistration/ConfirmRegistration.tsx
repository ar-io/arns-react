import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { REGISTRATION_TYPES } from '../../../types';
import { NAME_PRICE_INFO, SMARTWEAVE_TAG_SIZE } from '../../../utils/constants';
import { AntCard } from '../../cards';
import ArPrice from '../ArPrice/ArPrice';
import { Tooltip } from '../Tooltip/Tooltip';
import './styles.css';

function ConfirmRegistration() {
  const [
    { domain, antContract, tier, leaseDuration, antID, fee, registrationType },
  ] = useRegistrationState();
  return (
    <>
      <div className="register-name-modal center">
        <span className="text-large white">
          {domain}.arweave.net is available!
        </span>
        <div className="section-header">Confirm Domain Registration</div>
        <AntCard
          domain={domain ?? ''}
          id={antID ?? undefined}
          state={antContract?.state ?? undefined}
          compact={false}
          enableActions={false}
          disabledKeys={
            registrationType !== REGISTRATION_TYPES.USE_EXISTING
              ? ['evolve', 'id']
              : []
          }
          overrides={{
            tier,
            ttlSeconds: antContract?.records['@'].ttlSeconds,
            maxSubdomains: 100,
            leaseDuration: `${leaseDuration} Year`,
          }}
        />
        <span className="text faded underline" style={{ maxWidth: '475px' }}>
          You will sign a single transaction to register this domain.
        </span>
        <div className="flex flex-column center" style={{ gap: '0.2em' }}>
          <Tooltip message={NAME_PRICE_INFO}>
            <span className="white bold text-small">
              {fee.io?.toLocaleString()}&nbsp;IO&nbsp;+&nbsp;
              <ArPrice dataSize={SMARTWEAVE_TAG_SIZE} />
            </span>
          </Tooltip>
          <span className="text faded">Estimated Price</span>
        </div>
      </div>
    </>
  );
}

export default ConfirmRegistration;
