import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { ArweaveTransactionID } from '../../types';
import eventEmitter from '../../utils/events';

export function useWalletAddress(): {
  wallet: any;
  walletAddress: ArweaveTransactionID | undefined;
} {
  const navigate = useNavigate();
  const [{ wallet, walletAddress }, dispatchGlobalState] = useGlobalState();

  useEffect(() => {
    if (!wallet) {
      // remove address if wallet gets cleared
      dispatchGlobalState({
        type: 'setWalletAddress',
        payload: undefined,
      });
      return;
    }

    wallet
      .getWalletAddress()
      .then((address: ArweaveTransactionID) => {
        dispatchGlobalState({
          type: 'setWalletAddress',
          payload: address,
        });
      })
      .catch((error: Error) => {
        dispatchGlobalState({
          type: 'setWalletAddress',
          payload: undefined,
        });
        eventEmitter.emit('error', error);
        navigate('/connect');
      });
  }, [wallet]);

  return {
    walletAddress,
    wallet,
  };
}
