import { ANTContractJSON } from '../../../types';
import { byteSize } from '../../../utils';
import { NAME_PRICE_INFO } from '../../../utils/constants';
import { AntCard } from '../../cards';
import ArPrice from '../ArPrice/ArPrice';
import { Tooltip } from '../Tooltip/Tooltip';

function ConfirmAntCreation({ state }: { state: ANTContractJSON }) {
  return (
    <div className="card center">
      <AntCard
        domain={''}
        id={undefined}
        state={state}
        compact={false}
        enableActions={false}
        showTier={false}
        overrides={{
          targetId: state.records['@'].transactionId,
          ttlSeconds: state.records['@'].ttlSeconds,
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
