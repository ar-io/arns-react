import { useEffect, useState } from 'react';

import { PDNTContract } from '../../../services/arweave/PDNTContract';
import { PDNTContractJSON } from '../../../types';
import { byteSize } from '../../../utils';
import { NAME_PRICE_INFO } from '../../../utils/constants';
import { PDNTCard } from '../../cards';
import ArPrice from '../ArPrice/ArPrice';
import { Tooltip } from '../Tooltip/Tooltip';

function ConfirmPDNTCreation({ state }: { state: PDNTContractJSON }) {
  const [pdnt, setPDNT] = useState<PDNTContract>();
  useEffect(() => {
    setPDNT(new PDNTContract(state));
  }, [state]);

  if (!pdnt) {
    return <div>Something went wrong. Try again</div>;
  }

  return (
    <div className="register-name-modal center">
      <PDNTCard
        domain={''}
        id={undefined}
        state={state}
        compact={false}
        enableActions={false}
        showTier={false}
        overrides={{
          targetId: pdnt.getRecord('@').transactionId,
          ttlSeconds: pdnt.getRecord('@').ttlSeconds,
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
        You will sign a single transaction to deploy this PDNT.
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

export default ConfirmPDNTCreation;
