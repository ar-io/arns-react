import { ANTContractJSON } from '../../../types';
import { NAME_PRICE_INFO } from '../../../utils/constants';
import { AntCard } from '../../cards';
import { Tooltip } from '../Tooltip/Tooltip';

function ConfirmAntCreation({ state }: { state: ANTContractJSON }) {
  return (
    <div className="register-name-modal center">
      <AntCard
        domain={''}
        id={undefined}
        state={state}
        compact={true}
        enableActions={false}
        overrides={{
          tier: 1,
          ttlSeconds: state.records['@'].ttlSeconds,
          maxSubdomains: state.records['@'].maxSubdomains,
          leaseDuration: `N/A`,
        }}
      />
      <span className="text faded underline" style={{ maxWidth: '475px' }}>
        You will sign a single transaction to deploy this ANT.
      </span>
      <div className="flex flex-column center" style={{ gap: '0.2em' }}>
        <Tooltip message={NAME_PRICE_INFO}>
          <span className="white bold text-small">{0}&nbsp;AR&nbsp;</span>
        </Tooltip>
        <span className="text faded">Estimated Price</span>
      </div>
    </div>
  );
}

export default ConfirmAntCreation;
