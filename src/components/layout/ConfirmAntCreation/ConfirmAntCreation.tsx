import { ANTContractJSON } from '../../../types';
import { DEFAULT_TTL_SECONDS, NAME_PRICE_INFO } from '../../../utils/constants';
import { byteSize } from '../../../utils/searchUtils';
import { AntCard } from '../../cards';
import ArPrice from '../ArPrice/ArPrice';
import { Tooltip } from '../Tooltip/Tooltip';

function ConfirmAntCreation({ state }: { state: ANTContractJSON }) {
  return (
    <div className="register-name-modal center">
      <AntCard
        domain={''}
        id={undefined}
        state={state}
        compact={false}
        enableActions={false}
        showTier={false}
        overrides={{
          targetId:
            typeof state.records['@'] == 'string'
              ? state.records['@']
              : state.records['@'].transactionId,
          ttlSeconds:
            typeof state.records['@'] == 'string'
              ? DEFAULT_TTL_SECONDS
              : state.records['@'].ttlSeconds,
        }}
        disabledKeys={[
          'tier',
          'evolve',
          'maxSubdomains',
          'id',
          'domain',
          'leaseDuration',
        ]}
      />
      <span className="text faded underline" style={{ maxWidth: '475px' }}>
        You will sign a single transaction to deploy this ANT.
      </span>
      <div className="flex flex-column center" style={{ gap: '0.2em' }}>
        <Tooltip message={NAME_PRICE_INFO}>
          <span className="white bold text-small">
            <ArPrice dataSize={byteSize(JSON.stringify(state))} />
            &nbsp;
          </span>
        </Tooltip>
        <span className="text faded">Estimated Price</span>
      </div>
    </div>
  );
}

export default ConfirmAntCreation;
