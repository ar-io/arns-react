import { AoArNSNameData } from '@ar.io/sdk';
import { useANT } from '@src/hooks/useANT/useANT';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { isArweaveTransactionID } from '@src/utils';

import LeaseDurationFromEndTimestamp from '../data-display/LeaseDurationFromEndTimestamp';
import { Loader } from '../layout';
import ArweaveID, { ArweaveIdTypes } from '../layout/ArweaveID/ArweaveID';

function DomainDetailsCard({
  domainRecord,
  className,
}: {
  domainRecord?: AoArNSNameData;
  className?: string;
}) {
  const antState = useANT(domainRecord?.processId);

  return (
    <div className={className}>
      {domainRecord ? (
        <div className="flex flex-col p-2">
          <span className="flex gap-2 text-sm text-grey py-4 border-b-[1px] border-dark-grey whitespace-nowrap">
            Process ID:
            {isArweaveTransactionID(domainRecord.processId) ? (
              <ArweaveID
                id={new ArweaveTransactionID(domainRecord.processId)}
                shouldLink={true}
                characterCount={16}
                type={ArweaveIdTypes.CONTRACT}
              />
            ) : (
              'N/A'
            )}
          </span>
          <span className="flex text-sm gap-2 text-grey py-4 border-b-[1px] border-dark-grey whitespace-nowrap">
            Lease Duration:
            <span className="text-white">
              <LeaseDurationFromEndTimestamp
                endTimestamp={(domainRecord as any).endTimestamp}
              />
            </span>
          </span>
          <span className="flex gap-2 text-sm text-grey py-4 border-b-[1px] border-dark-grey whitespace-nowrap">
            Target ID:
            {isArweaveTransactionID(antState?.records?.['@']?.transactionId) ? (
              <ArweaveID
                id={
                  new ArweaveTransactionID(
                    antState?.records?.['@'].transactionId,
                  )
                }
                shouldLink={true}
                characterCount={16}
                type={ArweaveIdTypes.TRANSACTION}
              />
            ) : (
              'N/A'
            )}
          </span>
          <span className="flex gap-2 text-sm text-grey py-4 border-b-[1px] border-dark-grey whitespace-nowrap">
            Owner:
            {isArweaveTransactionID(antState.owner) ? (
              <ArweaveID
                id={new ArweaveTransactionID(antState.owner)}
                shouldLink={true}
                characterCount={16}
                type={ArweaveIdTypes.ADDRESS}
              />
            ) : (
              'N/A'
            )}
          </span>
        </div>
      ) : (
        <Loader size={100} message="Loading Domain Data..." />
      )}
    </div>
  );
}

export default DomainDetailsCard;
