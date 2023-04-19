import { useEffect } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { ArweaveTransactionID } from '../../types';
import eventEmitter from '../../utils/events';

export function useWalletAddress(): {
  wallet: any;
  walletAddress: ArweaveTransactionID | undefined;
} {
  const [{ wallet, walletAddress }, dispatchGlobalState] = useGlobalState();

  useEffect(() => {
    // add a listener for wallet changes in arconnect
    window.addEventListener('walletSwitch', (e) => {
      const address = e.detail.address;
      if (wallet) {
        wallet
          .getWalletAddress()
          .then((addr) => {
            if (addr.toString() !== address.toString()) {
              throw Error('Wallets are mismatched!');
            }
            // all good, update state
            dispatchGlobalState({
              type: 'setWalletAddress',
              payload: new ArweaveTransactionID(address),
            });
          })
          .catch((error: Error) => {
            dispatchGlobalState({
              type: 'setWalletAddress',
              payload: undefined,
            });
            dispatchGlobalState({
              type: 'setShowConnectWallet',
              payload: true,
            });
            eventEmitter.emit('error', error);
          });
      }
    });

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
        dispatchGlobalState({
          type: 'setShowConnectWallet',
          payload: true,
        });
        eventEmitter.emit('error', error);
      });
  }, [wallet]); // eslint-disable-line

  return {
    walletAddress,
    wallet,
  };
}
