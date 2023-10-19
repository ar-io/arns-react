import { Navigate, useLocation } from 'react-router-dom';

import { useWalletState } from '../../../state/contexts/WalletState';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [{ walletAddress }] = useWalletState();
  const location = useLocation();

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
