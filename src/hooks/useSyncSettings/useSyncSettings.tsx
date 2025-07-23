import { useGlobalState, useWalletState } from '@src/state';
import { useEffect, useRef } from 'react';

export const SETTINGS_STORAGE_KEY = 'arns-app-settings';

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

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      console.log(
        'Settings saved to localStorage:',
        SETTINGS_STORAGE_KEY,
        settings,
      );
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
