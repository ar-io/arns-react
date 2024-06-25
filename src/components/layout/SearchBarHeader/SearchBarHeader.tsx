import { ArrowDownOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useWalletState } from '@src/state/contexts/WalletState';

import { useIsMobile } from '../../../hooks';
import { SearchBarHeaderProps } from '../../../types';
import './styles.css';

function SearchBarHeader({
  defaultText,
  domain,
  processId,
  isAvailable,
  isReserved,
  reservedFor,
}: SearchBarHeaderProps): JSX.Element {
  const isMobile = useIsMobile();
  const [{ walletAddress }] = useWalletState();

  // reserved condition
  if (
    domain &&
    isReserved &&
    reservedFor?.toString() !== walletAddress?.toString()
  ) {
    return (
      <div
        className="text-medium white center flex fade-in"
        style={{
          fontWeight: 500,
          fontSize: '23px',
          flexDirection: isMobile ? 'column' : 'row',
          minHeight: '45px',
        }}
      >
        <span className="reserved">{domain}&nbsp;</span>
        is currently reserved.
      </div>
    );
  }
  // unavailable condition
  if (processId && domain) {
    return (
      <div
        className="text-medium white center flex fade-in"
        style={{
          fontWeight: 500,
          fontSize: '23px',
          flexDirection: isMobile ? 'column' : 'row',
          minHeight: '45px',
        }}
      >
        <span className="unavailable">{domain}&nbsp;</span>
        is already registered. Try another name.
      </div>
    );
  }

  // available condition
  if (domain && isAvailable) {
    return (
      <div
        className="text-medium white center flex fade-in"
        style={{
          fontWeight: 500,
          fontSize: '23px',
          flexDirection: isMobile ? 'column' : 'row',
          minHeight: '45px',
        }}
      >
        <span style={{ color: 'var(--success-green)' }}>{domain}</span>&nbsp;is
        available!&nbsp;
        <CheckCircleFilled
          style={{ fontSize: '20px', color: 'var(--success-green)' }}
        />
      </div>
    );
  }

  // default search state

  return (
    <div
      className="flex flex-column flex-center text-medium white fade-in"
      style={{ gap: '5px', minHeight: '45px' }}
    >
      {defaultText} <ArrowDownOutlined />
    </div>
  );
}
export default SearchBarHeader;
