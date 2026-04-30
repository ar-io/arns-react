import { useGlobalState, useWalletState } from '@src/state';
import { useEffect, useRef } from 'react';

export const SETTINGS_STORAGE_KEY = 'arns-app-settings';

interface NetworkSettings {
  gateway: string;
  turboNetwork: {
    UPLOAD_URL: string;
    PAYMENT_URL: string;
    GATEWAY_URL: string;
    WALLETS_URL: string;
    STRIPE_PUBLISHABLE_KEY: string;
  };
}

interface Settings {
  network: NetworkSettings;
}

/**
 * Persist user-modified network settings to localStorage. Solana-only after
 * the de-AO refactor — gateway + Turbo are the only knobs that survive; all
 * AO process IDs / CU urls / hyperbeam URLs are gone.
 */
function useSyncSettings() {
  const [{ gateway, turboNetwork }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    isInitialLoad.current = false;

    const settings: Settings = {
      network: {
        gateway,
        turboNetwork,
      },
    };

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [walletAddress, gateway, turboNetwork]);

  return null;
}

export default useSyncSettings;
