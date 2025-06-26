import { useGlobalState, useWalletState } from '@src/state';
import { useEffect } from 'react';

const SETTINGS_STORAGE_KEY = 'arNS_settings';

interface NetworkSettings {
  gateway: string;
  aoNetwork: {
    ARIO: {
      CU_URL: string;
      MU_URL: string;
      SCHEDULER: string;
    };
    ANT: {
      CU_URL: string;
      MU_URL: string;
      SCHEDULER: string;
      GRAPHQL_URL: string;
    };
    HYPERBEAM: {
      URL: string;
      ENABLED: boolean;
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
  const [{ gateway, aoNetwork, turboNetwork, arioProcessId }] =
    useGlobalState();
  const [{ walletAddress }] = useWalletState();

  // Save settings when they change
  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    const settings: Settings = {
      network: {
        gateway,
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
  }, [walletAddress, gateway, aoNetwork, turboNetwork, arioProcessId]);

  return null;
}

export default useSyncSettings;
