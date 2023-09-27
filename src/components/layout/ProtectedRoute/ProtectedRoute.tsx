import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { ARCONNECT_WALLET_PERMISSIONS } from '../../../services/wallets/ArConnectWalletConnector';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import PageLoader from '../progress/PageLoader/PageLoader';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [{ walletAddress }] = useGlobalState();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermissions, setHasPermissions] = useState(true);

  useEffect(() => {
    const handleArweaveWalletLoaded = async () => {
      // Check for permissions
      const permissions = await window.arweaveWallet.getPermissions(); // Replace with actual API call
      const hasRequiredPermissions = ARCONNECT_WALLET_PERMISSIONS.every(
        (perm) => permissions.includes(perm),
      );

      setHasPermissions(hasRequiredPermissions);

      if (hasRequiredPermissions) {
        setIsLoading(false);
      }
    };

    if (window.arweaveWallet) {
      handleArweaveWalletLoaded();
    } else {
      window.addEventListener('arweaveWalletLoaded', handleArweaveWalletLoaded);
    }

    return () => {
      window.removeEventListener(
        'arweaveWalletLoaded',
        handleArweaveWalletLoaded,
      );
    };
  }, []);

  useEffect(() => {
    if (walletAddress !== undefined) {
      setIsLoading(false);
    }
  }, [walletAddress]);

  if (isLoading && !walletAddress && hasPermissions) {
    return <PageLoader loading={true} message={'Connecting to Wallet'} />; // Replace with your loading component
  }

  return walletAddress ? (
    children
  ) : (
    <Navigate
      to={location?.state?.to ?? '/connect'}
      state={{
        from: location.pathname,
        to: location?.state?.to ?? location.pathname ?? '/',
      }}
    />
  );
}

export default ProtectedRoute;
