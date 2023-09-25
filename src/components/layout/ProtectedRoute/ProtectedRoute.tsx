import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import PageLoader from '../progress/PageLoader/PageLoader';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [{ walletAddress }] = useGlobalState();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching walletAddress asynchronously
  useEffect(() => {
    if (walletAddress !== undefined) {
      setIsLoading(false);
    }
    if (!walletAddress && location.pathname !== '/connect') {
      setIsLoading(true);
    }
  }, [walletAddress, location]);

  // if (isLoading) {
  //   return (
  //     <PageLoader
  //       loading={true}
  //       message={'Connecting to wallet, please wait.'}
  //     />
  //   ); // Replace with your loading component
  // }

  return walletAddress ? (
    children
  ) : (
    <Navigate
      to={location?.state?.to ?? '/connect'}
      state={{
        from: location.pathname,
        to: location?.state?.to ?? '/',
      }}
    />
  );
}

export default ProtectedRoute;
