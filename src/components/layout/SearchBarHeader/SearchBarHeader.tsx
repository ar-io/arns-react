import { ArrowDownOutlined, CheckCircleFilled } from '@ant-design/icons';

import { useIsMobile } from '../../../hooks';
import { SearchBarHeaderProps } from '../../../types';
import { isDomainReservedLength } from '../../../utils';
import './styles.css';

function SearchBarHeader({
  defaultText,
  domain,
  contractTxId,
  isAvailable,
  isAuction,
  isReserved,
}: SearchBarHeaderProps): JSX.Element {
  const isMobile = useIsMobile();

  // unavailable condition
  if (domain && isAuction) {
    return (
      <span
        className="text-medium white center flex fade-in"
        style={{
          fontWeight: 500,
          fontSize: '23px',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <span className="in-auction">{domain}&nbsp;</span>
        is currently in auction.
      </span>
    );
  }

  // reserved condition
  if (domain && (isReserved || isDomainReservedLength(domain))) {
    return (
      <span
        className="text-medium white center flex fade-in"
        style={{
          fontWeight: 500,
          fontSize: '23px',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <span className="reserved">{domain}&nbsp;</span>
        is currently reserved.
      </span>
    );
  }
  // unavailable condition
  if (contractTxId && domain) {
    return (
      <span
        className="text-medium white center flex fade-in"
        style={{
          fontWeight: 500,
          fontSize: '23px',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <span className="unavailable">{domain}&nbsp;</span>
        is already registered. Try another name.
      </span>
    );
  }

  // available condition
  if (domain && isAvailable) {
    return (
      <span
        className="text-medium white center flex fade-in"
        style={{
          fontWeight: 500,
          fontSize: '23px',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <span style={{ color: 'var(--success-green)' }}>{domain}</span>&nbsp;is
        available!&nbsp;
        <CheckCircleFilled
          style={{ fontSize: '20px', color: 'var(--success-green)' }}
        />
      </span>
    );
  }

  // default search state

  return (
    <div
      className="flex flex-column flex-center text-medium white fade-in"
      style={{ gap: '5px' }}
    >
      {defaultText} <ArrowDownOutlined />
    </div>
  );
}
export default SearchBarHeader;
