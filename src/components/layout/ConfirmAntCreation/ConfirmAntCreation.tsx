import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ANTContractJSON } from '../../../types';
import { NAME_PRICE_INFO } from '../../../utils/constants';
import { AntCard } from '../../cards';
import ArPrice from '../ArPrice/ArPrice';
import { Tooltip } from '../Tooltip/Tooltip';

function ConfirmAntCreation({ state }: { state: ANTContractJSON }) {
  const [{ arweaveDataProvider }] = useGlobalState();
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
          targetId: state.records['@'].transactionId,
        }}
        disabledKeys={[
          'tier',
          'evolve',
          'maxSubdomains',
          'ttlSeconds',
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
            <ArPrice data={state} />
            &nbsp;AR&nbsp;
          </span>
        </Tooltip>
        <span className="text faded">Estimated Price</span>
      </div>
    </div>
  );
}

export default ConfirmAntCreation;
