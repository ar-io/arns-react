import { useGlobalState } from '../../state/contexts/GlobalState';
import { ArweaveTransactionID } from '../../types';

export function useWalletAddress(): {
  wallet: any;
  walletAddress: ArweaveTransactionID | undefined;
} {
  const [{ wallet, walletAddress }] = useGlobalState();

  return {
    walletAddress,
    wallet,
  };
}
