import { useEffect } from 'react';

import { ArConnectWalletConnector } from '../../services/wallets';
import { ARCONNECT_WALLET_PERMISSIONS } from '../../services/wallets/ArConnectWalletConnector';
import { useGlobalState } from '../../state/contexts/GlobalState';
import { ArweaveTransactionID } from '../../types';
import eventEmitter from '../../utils/events';

export function useWalletAddress(): {
  wallet: any;
  walletAddress: ArweaveTransactionID | undefined;
} {
  const [{ wallet, walletAddress }, dispatchGlobalState] = useGlobalState();

  useEffect(() => {
    updateIfConnected();
  }, []);

  async function updateIfConnected() {
    try {
      const connector = new ArConnectWalletConnector();
      const permissions = await window.arweaveWallet.getPermissions();

      if (
        permissions.length &&
        ARCONNECT_WALLET_PERMISSIONS.every((p) => permissions.includes(p))
      ) {
        await connector.connect();
        const address = await connector.getWalletAddress();

        dispatchGlobalState({
          type: 'setWalletAddress',
          payload: address,
        });
        dispatchGlobalState({
          type: 'setWallet',
          payload: connector,
        });
      }
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  return {
    walletAddress,
    wallet,
  };
}
