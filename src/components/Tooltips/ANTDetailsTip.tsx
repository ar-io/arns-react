import { InfoCircleOutlined } from '@ant-design/icons';
import { useANT } from '@src/hooks/useANT/useANT';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { isArweaveTransactionID } from '@src/utils';
import { ReactNode } from 'react';

import { Tooltip } from '../data-display';
import { Loader } from '../layout';
import ArweaveID, { ArweaveIdTypes } from '../layout/ArweaveID/ArweaveID';

function ANTDetailsTip({
  antId,
  icon = (
    <InfoCircleOutlined className="fill-grey" width={'14px'} height={'14px'} />
  ),
}: {
  antId: string;
  icon?: ReactNode;
}) {
  const { loading: loadingAntState, ...antState } = useANT(antId);
  return (
    <Tooltip
      tooltipOverrides={{
        overlayClassName: 'flex w-fit',
        overlayStyle: { width: 'fit-content' },
        overlayInnerStyle: { width: 'fit-content' },
      }}
      message={
        antState && !loadingAntState ? (
          <div className="flex flex-col p-2">
            <span className="flex gap-2 text-sm text-grey py-4 border-b-[1px] border-dark-grey whitespace-nowrap">
              Process ID:
              {isArweaveTransactionID(antId) ? (
                <ArweaveID
                  id={new ArweaveTransactionID(antId)}
                  shouldLink={true}
                  characterCount={16}
                  type={ArweaveIdTypes.CONTRACT}
                />
              ) : (
                'N/A'
              )}
            </span>

            <span className="flex gap-2 text-sm text-grey py-4 border-b-[1px] border-dark-grey whitespace-nowrap">
              Target ID:
              {isArweaveTransactionID(
                antState?.records?.['@'].transactionId,
              ) ? (
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
        )
      }
      icon={icon}
    />
  );
}

export default ANTDetailsTip;
