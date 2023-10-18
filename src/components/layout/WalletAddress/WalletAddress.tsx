import { useWalletState } from '../../../state/contexts/WalletState';
import Loader from '../Loader/Loader';
import './styles.css';

export function WalletAddress({ characterCount }: { characterCount?: number }) {
  const [{ walletAddress }] = useWalletState();

  function handleText(text: string) {
    if (characterCount) {
      const shownCount = Math.round(characterCount / 2);
      return `${text.slice(0, shownCount)}...${text.slice(
        text.length - shownCount,
        text.length,
      )}`;
    }

    return text;
  }
  return (
    <>
      {walletAddress ? (
        <div className="flex-row" style={{ gap: '0.4em' }}>
          <span className="dot"></span>
          <span className="text white">
            {handleText(walletAddress.toString())}
          </span>
        </div>
      ) : (
        <Loader size={20} />
      )}
    </>
  );
}
