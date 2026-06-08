import { InfoCircleOutlined } from '@ant-design/icons';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { SolanaAddress } from '@src/services/solana/SolanaAddress';
import {
  formatForMaxCharCount,
  isArweaveTransactionID,
  isValidAoAddress,
} from '@src/utils';
import { ReactNode } from 'react';

import { Tooltip } from '../data-display';
import ArweaveID, { ArweaveIdTypes } from '../layout/ArweaveID/ArweaveID';

function ANTDetailsTip({
  antId,
  targetId,
  owner,
  icon = (
    <InfoCircleOutlined className="text-grey" width={'14px'} height={'14px'} />
  ),
}: {
  antId?: string;
  targetId?: string;
  owner?: string;
  icon?: ReactNode;
}) {
  return (
    <Tooltip
      tooltipOverrides={{
        arrow: false,
        overlayClassName: 'flex w-fit',
        overlayStyle: {
          width: 'fit-content',
        },
        overlayInnerStyle: {
          width: 'fit-content',
          border: '1px solid var(--text-faded)',
          boxSizing: 'border-box',
        },
      }}
      message={
        <div className="flex flex-col p-2">
          <span className="flex text-sm text-grey pb-4 pt-0 border-b-[1px] border-dark-grey whitespace-nowrap gap-2">
            Process ID:{' '}
            {antId && isValidAoAddress(antId) ? (
              <ArweaveID
                id={
                  isArweaveTransactionID(antId)
                    ? new ArweaveTransactionID(antId)
                    : new SolanaAddress(antId)
                }
                shouldLink={true}
                characterCount={16}
                type={ArweaveIdTypes.CONTRACT}
              />
            ) : (
              'N/A'
            )}
          </span>

          <span className="flex gap-2 text-sm text-grey py-4 border-b-[1px] border-dark-grey whitespace-nowrap">
            Target ID:{' '}
            {isArweaveTransactionID(targetId) ? (
              <ArweaveID
                id={new ArweaveTransactionID(targetId)}
                shouldLink={true}
                characterCount={16}
                type={ArweaveIdTypes.TRANSACTION}
              />
            ) : (
              'N/A'
            )}
          </span>
          <span className="flex gap-2 text-sm text-grey pt-4 pb-0 whitespace-nowrap">
            Owner:{' '}
            {isValidAoAddress(owner ?? '') ? (
              <ArweaveID
                id={
                  isArweaveTransactionID(owner)
                    ? new ArweaveTransactionID(owner!)
                    : new SolanaAddress(owner!)
                }
                shouldLink={true}
                characterCount={16}
                type={ArweaveIdTypes.ADDRESS}
              />
            ) : (
              formatForMaxCharCount(owner ?? 'N/A', 16)
            )}
          </span>
        </div>
      }
      icon={icon}
    />
  );
}

export default ANTDetailsTip;
