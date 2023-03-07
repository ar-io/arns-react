import {
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { Layout } from './components/layout';
import { ConnectWalletModal, CreateAntModal } from './components/modals';
import { About, Home, Manage, NotFound } from './components/pages';
import {
  useArNSContract,
  useArweave,
  useConnectWalletModal,
  useWalletAddress,
} from './hooks/';
import './index.css';
import { useGlobalState } from './state/contexts/GlobalState';
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
        {wallet && walletAddress ? (
          <Route path="manage" element={<Manage />} />
        ) : (
          <></>
        )}
        <Route path="*" element={<NotFound />} />
      </Route>,
    ),
  );

  return (
    <>
      <RouterProvider router={router} />
      <ConnectWalletModal show={showConnectModal} />
      <CreateAntModal />
    </>
  );
}

export default App;
