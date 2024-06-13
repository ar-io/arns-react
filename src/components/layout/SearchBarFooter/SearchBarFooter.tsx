import { useWalletState } from '@src/state/contexts/WalletState';

import { SearchBarFooterProps } from '../../../types';
import { isDomainReservedLength, lowerCaseDomain } from '../../../utils';
import ANTCard from '../../cards/ANTCard/ANTCard';
import ReservedNameNotificationCard from '../ReservedNameNotificationCard/ReservedNameNotificationCard';
import './styles.css';

function SearchBarFooter({
  domain,
  record,
  processId,
  isAvailable,
  isReserved,
  reservedFor,
}: SearchBarFooterProps): JSX.Element {
  const [{ walletAddress }] = useWalletState();

  if (
    domain &&
    (isReserved || isDomainReservedLength(lowerCaseDomain(domain))) &&
    reservedFor?.toString() !== walletAddress?.toString()
  ) {
    return (
      <div className="flex flex-row" style={{ marginTop: '30px' }}>
        <ReservedNameNotificationCard />
      </div>
    );
  }
  return (
    <div
      className="flex flex-column"
      style={{ marginTop: '30px', boxSizing: 'border-box' }}
    >
      {!isAvailable && record && processId && domain ? (
        <>
          <span className="flex flex-row white text-medium flex-left">
            Ownership Details:
          </span>
          <ANTCard
            domain={domain}
            processId={processId}
            record={record}
            compact={true}
            bordered
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
export default SearchBarFooter;
