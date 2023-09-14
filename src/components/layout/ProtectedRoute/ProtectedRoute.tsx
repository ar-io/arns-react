import { Navigate, useLocation } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [{ walletAddress }] = useGlobalState();
  const location = useLocation();

  return walletAddress ? (
    children
  ) : (
    <Navigate
      to={location?.state?.to ?? '/connect'}
      state={{ from: location.pathname, to: location?.state?.to ?? '/connect' }}
    />
  );
}

export default ProtectedRoute;
