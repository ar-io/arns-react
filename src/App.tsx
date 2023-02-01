import {
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { Layout } from './components/layout';
import ConnectWalletModal from './components/modals/ConnectWalletModal/ConnectWalletModal';
import { About, Create, Home, Manage, NotFound } from './components/pages';
import {
  useArNSContract,
  useArweave,
  useConnectWalletModal,
  useWalletAddress,
} from './hooks/';
import './index.css';
import RegistrationStateProvider from './state/contexts/RegistrationState';
import { registrationReducer } from './state/reducers/RegistrationReducer';

function App() {
  // dispatches global state
  useArNSContract();
  // setup default arweave data provider
  useArweave();

  const { showConnectModal } = useConnectWalletModal();
  const { wallet, walletAddress } = useWalletAddress();

  const router = createHashRouter(
    createRoutesFromElements(
      <Route element={<Layout />} errorElement={<NotFound />}>
        <Route
          index
          element={
            <RegistrationStateProvider reducer={registrationReducer}>
              <Home />
            </RegistrationStateProvider>
          }
        />
        <Route path="info" element={<About />} />
        <Route path="create" element={<Create />} />
        {wallet && walletAddress ? (
          <Route path="manage" element={<Manage />} />
        ) : (
          <></>
        )}
        <Route path="*" element={<NotFound />} />
      </Route>,
    ),
    {
      // TODO: remove this when we're no longer deploying to github pages
      basename: process.env.NODE_ENV !== 'test' ? '/arns-react/' : '/',
    },
  );

  return (
    <>
      <RouterProvider router={router} />
      <ConnectWalletModal show={showConnectModal} />
    </>
  );
}

export default App;
