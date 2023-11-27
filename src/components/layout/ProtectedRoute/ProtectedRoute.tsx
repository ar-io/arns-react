import { Navigate, useLocation } from 'react-router-dom';

import { useWalletState } from '../../../state/contexts/WalletState';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [{ walletAddress }] = useWalletState();
  const location = useLocation();

  return walletAddress ? (
    children
  ) : (
    <Navigate
      to={`/connect${location.search}`}
      state={{
        from: location?.state?.from,
        to: location?.state?.to ?? location.pathname + location.search ?? '/',
      }}
    />
  );
}

export default ProtectedRoute;
