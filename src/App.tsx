import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { Layout } from './components/layout';
import ConnectWalletModal from './components/modals/ConnectWalletModal/ConnectWalletModal';
import { About, FAQ, Home, ManageAssets, NotFound } from './components/pages';
import {
  useArNSContract,
  useArweave,
  useConnectWalletModal,
  useWalletAddress,
} from './hooks/';
import './index.css';

function App() {
  // dispatches global state
  useArNSContract();
  // setup arweave client
  useArweave();
  const { showConnectModal } = useConnectWalletModal();
  const { wallet, walletAddress } = useWalletAddress();

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />} errorElement={<NotFound />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="faq" element={<FAQ />} />
        {wallet && walletAddress ? (
          <Route path="manage" element={<ManageAssets />} />
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
