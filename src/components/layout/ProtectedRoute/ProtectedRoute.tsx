import { Navigate } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [{ walletAddress }] = useGlobalState();

  return walletAddress ? children : <Navigate to="/connect" />;
}

export default ProtectedRoute;
