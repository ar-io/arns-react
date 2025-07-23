import { useGlobalState, useWalletState } from '@src/state';
import { useEffect, useRef } from 'react';

const SETTINGS_STORAGE_KEY = 'arns-app-settings';

interface NetworkSettings {
  gateway: string;
  hyperbeamUrl?: string;
  aoNetwork: {
    ARIO: {
      CU_URL: string;
      MU_URL: string;
      SCHEDULER: string;
      HYPERBEAM_URL?: string;
    };
    ANT: {
      CU_URL: string;
      MU_URL: string;
      SCHEDULER: string;
      GRAPHQL_URL: string;
      HYPERBEAM_URL?: string;
    };
  };
  turboNetwork: {
    UPLOAD_URL: string;
    PAYMENT_URL: string;
    GATEWAY_URL: string;
    WALLETS_URL: string;
    STRIPE_PUBLISHABLE_KEY: string;
  };
}

interface ArNSSettings {
  arioProcessId: string;
}

interface Settings {
  network: NetworkSettings;
  arns: ArNSSettings;
}

function useSyncSettings() {
  const [{ gateway, hyperbeamUrl, aoNetwork, turboNetwork, arioProcessId }] =
    useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const isInitialLoad = useRef(true);

  // Save settings when they change
  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    // Skip saving on initial load when hyperbeamUrl is undefined
    // This prevents overwriting saved settings with undefined on first load
    if (isInitialLoad.current && hyperbeamUrl === undefined) {
      isInitialLoad.current = false;
      return;
    }

    isInitialLoad.current = false;

    const settings: Settings = {
      network: {
        gateway,
        hyperbeamUrl,
        aoNetwork,
        turboNetwork,
      },
      arns: {
        arioProcessId,
      },
    };

    // Save to wallet-specific key
    const walletKey = `${SETTINGS_STORAGE_KEY}_${walletAddress}`;

    // Also save to a "last" key for persistence across wallet switches
    const lastKey = `${SETTINGS_STORAGE_KEY}_last`;

    try {
      localStorage.setItem(walletKey, JSON.stringify(settings));
      localStorage.setItem(lastKey, JSON.stringify(settings));
      console.log('Settings saved to localStorage:', walletKey, settings);
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [
    walletAddress,
    gateway,
    hyperbeamUrl,
    aoNetwork,
    turboNetwork,
    arioProcessId,
  ]);

  return null;
}

export default useSyncSettings;
