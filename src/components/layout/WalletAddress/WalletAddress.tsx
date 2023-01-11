import { useIsMobile, useWalletAddress } from '../../../hooks';
import './styles.css';

export function WalletAddress() {
  const { walletAddress } = useWalletAddress();
  const isMobile = useIsMobile();
  return (
    <>
      {walletAddress ? (
        <div className="flex-row" style={{ gap: '0.4em' }}>
          <span className="dot"></span>
          <span className="text white">
            {walletAddress.slice(0, isMobile ? 2 : 4)}...
            {walletAddress.slice(isMobile ? -2 : -4)}
          </span>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
