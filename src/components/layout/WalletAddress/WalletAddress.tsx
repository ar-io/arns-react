import { useWalletState } from '../../../state/contexts/WalletState';
import Loader from '../Loader/Loader';

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
        <div className="flex flex-row items-center gap-[0.4em]">
          <span className="h-2 w-2 bg-success rounded-full"></span>
          <span className="text-sm text-white">
            {handleText(walletAddress.toString())}
          </span>
        </div>
      ) : (
        <Loader size={20} />
      )}
    </>
  );
}
